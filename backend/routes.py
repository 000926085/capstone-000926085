import logging
import json
import traceback
import requests
import asyncio

from logging.handlers import RotatingFileHandler
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from supabase_client import supabase

import functions.helpers as helpers
import functions.calculations as calculations
import queries as gql

# Logging setup.
logger = logging.getLogger("app_logger")
logger.setLevel(logging.ERROR)
file_handler = RotatingFileHandler("error.log", maxBytes=5_000_000, backupCount=1)
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# FastAPI setup.
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Intercepts uncaught exceptions and logs the stack trace to a secure internal file.
    
    args:
        request (Request): the FastAPI request object.
        exc (Exception): the uncaught exception.
    
    returns:
        JSONResponse: contains a generic error message.
    """
    tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    logger.error(f"Unhandled Exception at {request.method} {request.url.path}:\n{tb}")
    
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )

@app.get("/api/test-error")
def test_error():
    """
    Testing route to verify that the internal logging is functional.
    """
    raise RuntimeError("Test error to verify logging functionalities.")

@app.post("/api/import-anilist-user/{username}")
def import_anilist_user(username: str):
    async def generate_progress():
        try:
            yield json.dumps({"step": "supabase_check", "message": "Checking database for username..."}) + "\n"
            await asyncio.sleep(0.1)

            # Construct a supabase query to first check the database for a user.
            supabase_query = (
                supabase.table("users")
                .select("*", count="exact")
                .eq("username", username)
                .execute()
            )

            # Check if the user doesn't exist or has stale data.
            stale = (
                supabase_query.count == 0
                or helpers.hour_difference(supabase_query.data[0]["last_updated"]) >= 24
            )

            if not stale:
               yield json.dumps({"step": "complete", "message": f"User {username} is up to date."}) + "\n"
               return

            # Make a POST request to the AniList API for fresh list data.
            yield json.dumps({"step": "anilist_fetch", "message": "Fetching anime lists from AniList..."}) + "\n"
            url = "https://graphql.anilist.co"
            response = requests.post(url, json={
                "query": gql.IMPORT_USER,
                "variables": {"username": username}
            })

            if response.status_code == 404:
                yield json.dumps({"error": "An AniList account with this username does not exist.", "status_code": 404}) + "\n"
                return
            if response.status_code != 200:
                yield json.dumps({"error": "AniList servers returned an error.", "status_code": 502}) + "\n"
                return

            res_json = response.json()
            if "errors" in res_json or not res_json.get("data") or not res_json["data"].get("User"):
                yield json.dumps({"error": "An AniList account with this username does not exist.", "status_code": 404}) + "\n"
                return

            # Retrieve fields from the data returned by the API.
            yield json.dumps({"step": "parsing", "message": "Parsing anime entries..."}) + "\n"
            data = res_json["data"]
            avatar = data.get("User").get("avatar").get("large")
            user_avg = data.get("User").get("statistics").get("anime").get("meanScore")
            list_data = data.get("MediaListCollection").get("lists")

            # Retrieve all anime from the user's list in preparation for storage.
            raw_anime = [
                {
                    **entry["media"],
                    "user_score": entry.get("score", 0),
                    "user_status": entry.get("status"),
                    "anilist_id": entry["media"].get("id"),
                    "startDate": helpers.format_date(entry["media"].get("startDate")),
                    "endDate": helpers.format_date(entry["media"].get("endDate")),
                    "cover": entry["media"].get("coverImage", {}).get("large")
                }
                for c in list_data if not c.get("isCustomList")
                for entry in c.get("entries", [])
                if entry.get("media", {}).get("status") != "NOT_YET_RELEASED"
            ]

            seen_ids = set()
            all_anime = []
            for anime in raw_anime:
                aid = anime.get("anilist_id")
                if aid not in seen_ids:
                    seen_ids.add(aid)
                    all_anime.append(anime)

            # Check if the user has at least one valid show within their planning list.
            valid_planning_anime = [
                entry for c in list_data if not c.get("isCustomList")
                for entry in c.get("entries", [])
                if entry.get("status") == "PLANNING" 
                and entry.get("media", {}).get("status") != "NOT_YET_RELEASED"
            ]
            if not valid_planning_anime: 
                yield json.dumps({"error": "This AniList account has no valid anime within their planning list.", "status_code": 400 }) + "\n"

            yield json.dumps({"step": "calculating", "message": "Calculating category affinities..."}) + "\n"
            genre_affinities = calculations.affinity_score(all_anime, "genres", user_avg, "genre")
            tag_affinities = calculations.affinity_score(all_anime, "tags", user_avg, "tag")
            studio_affinities = calculations.affinity_score(all_anime, "studios", user_avg, "studio")
            director_affinities = calculations.affinity_score(all_anime, "staff", user_avg, "director")

            yield json.dumps({"step": "saving", "message": "Saving data to Supabase..."}) + "\n"
            # Postgres function for handling behaviour when provided with a user to setup.
            supabase.rpc(
                "user_setup",
                {
                    "p_anime": all_anime,
                    "p_username": username,
                    "p_avatar": avatar,
                    "p_genres_affinity": genre_affinities,
                    "p_tags_affinity": tag_affinities,
                    "p_studios_affinity": studio_affinities,
                    "p_directors_affinity": director_affinities,
                }
            ).execute()

            yield json.dumps({"step": "complete", "message": f"User {username} successfully imported."}) + "\n"
            
        except Exception as e:
            logger.error(f"Import failed for '{username}': {str(e)}")
            yield json.dumps({"error": "An unexpected error occurred during import.", "status_code": 500}) + "\n"

    return StreamingResponse(generate_progress(), media_type="application/x-ndjson")

@app.get("/api/user-exists/{username}")
def user_exists(username: str):
    supabase_query = (
        supabase.table("users")
        .select("*", count="exact")
        .eq("username", username)
        .execute()
    )

    if supabase_query.count == 0:
        raise HTTPException(status_code=404, detail=f"User '{username}' was not found within the database.")

    return {"exists": True, "user": supabase_query.data[0]}

@app.get("/api/anime-carousel")
def anime_carousel():
    """
    Simple query against the database to fetch the 100 most popular anime within the database.
    """
    supabase_query = (
        supabase.table("anime")
        .select("*", count="exact")
        .order("popularity", desc=True)
        .neq("cover", None) 
        .limit(100)
        .execute()
    )

    return supabase_query.data

@app.get("/api/fetch-planning-data/{username}")
def fetch_planning_data(username: str):
    """
        Calls the Supabase database to fetch the anime within a user's list with the "Planning" or "Paused" status.

        args:
            username (str): the AniList username to import.
        
        returns:
            last_updated (timestamp): indicates the last update to the user's profile data.
            planning_anime (Object): contains data pertaining to an anime, as well as the user's relation to it.
    """

    # Fetch the user_id.
    user_res = (
        supabase.table("users")
        .select("user_id, last_updated", count="exact")
        .eq("username", username)
        .maybe_single()
        .execute()
    )

    if not user_res or not user_res.data:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found.")

    data = user_res.data
    user_id = data["user_id"]

    # Fetch PLANNING or PAUSED anime within the user's list. 
    # Also fetch genres, tags, studios, director and AniList's recommendations for each anime.
    planning_res = (
        supabase.table("users_anime")
        .select("""
            list_status,
            anime(
                *,
                anime_genres(genres(name)),
                anime_tags(similarity, tags(name)),
                anime_studios(studios(name)),
                anime_directors(directors(name)),
                anilist_recommendations!anilist_recommendations_anime_id_fkey(
                    rank,
                    recommended_anime_id
                )
            )
        """)
        .eq("user_id", user_id)
        .in_("list_status", ["PLANNING", "PAUSED"])
        .execute()
    )

    # Fetch the user's entire anime list.
    user_anime_res = (
        supabase.table("users_anime")
        .select("anime_id, list_status, score, anime(popularity)")
        .eq("user_id", user_id)
        .execute()
    )
    user_anime = {
        item["anime_id"]: {
            "status": item["list_status"],
            "score": item["score"]
        }
        for item in user_anime_res.data
    }

    # Find the most popular show in a user's list, used to normalize the popularity component of the base desirability score.
    max_popularity = max((
        item["anime"]["popularity"]
        for item in user_anime_res.data
        if item.get("anime") and item["anime"].get("popularity") is not None), default=1)

    # Fetch the user's genre affinities.
    genre_affinity_res = (
        supabase.table("user_genres_affinity")
        .select("genre_id, affinity, genres(name)")
        .eq("user_id", user_id)
        .execute()
    )
    genre_affinities = {
        item["genres"]["name"]: item["affinity"]["multiplier"]
        for item in genre_affinity_res.data
        if item.get("genres") and item.get("affinity")
    }

    # Fetch the user's tag affinities.
    tag_affinity_res = (
        supabase.table("user_tags_affinity")
        .select("tag_id, affinity, tags(name)")
        .eq("user_id", user_id)
        .execute()
    )
    tag_affinities = {
        item["tags"]["name"]: item["affinity"]["multiplier"]
        for item in tag_affinity_res.data
        if item.get("tags") and item.get("affinity")
    }

    # Fetch the user's studio affinities.
    studio_affinity_res = (
        supabase.table("user_studios_affinity")
        .select("studio_id, affinity, studios(name)")
        .eq("user_id", user_id)
        .execute()
    )
    studio_affinities = {
        item["studios"]["name"]: item["affinity"]["multiplier"]
        for item in studio_affinity_res.data
        if item.get("studios") and item.get("affinity")
    }

    # Fetch the user's director affinities.
    director_affinity_res = (
        supabase.table("user_directors_affinity")
        .select("director_id, affinity, directors(name)")
        .eq("user_id", user_id)
        .execute()
    )
    director_affinities = {
        item["directors"]["name"]: item["affinity"]["multiplier"]
        for item in director_affinity_res.data
        if item.get("directors") and item.get("affinity")
    }

    # Build the list of anime.
    anime_list = []
    for item in planning_res.data:
        anime = item.get("anime")
        if not anime:
            continue

        # Extract genres
        genres = [
            relation["genres"]["name"]
            for relation in anime.get("anime_genres", [])
            if relation.get("genres")
        ]

        # Extract tags
        tags = [
            {
                "name": relation["tags"]["name"],
                "similarity": relation["similarity"]
            }
            for relation in anime.get("anime_tags", [])
            if relation.get("tags")
        ]

        # Extract studios
        studios = [
            relation["studios"]["name"]
            for relation in anime.get("anime_studios", [])
            if relation.get("studios")
        ]

        # Extract directors
        directors = [
            relation["directors"]["name"]
            for relation in anime.get("anime_directors", [])
            if relation.get("directors")
        ]

        # Extract data pertaining to recommendations on the AniList page of an anime.
        anilist_recommendations = []
        for rec in anime.get("anilist_recommendations", []):
            watched = user_anime.get(rec["recommended_anime_id"])
        
            anilist_recommendations.append({
                "rank": rec["rank"],
                "score": watched["score"] if watched else None,
                "status": watched["status"] if watched else None
        })

        # Remove the raw relationship data from the anime object.
        anime.pop("anime_genres", None)
        anime.pop("anime_tags", None)
        anime.pop("anime_studios", None)
        anime.pop("anime_directors", None)
        anime.pop("anilist_recommendations", None)

        # Build the response object and calculate its final desirability.
        anime_list.append({
            **anime,
            "genres": genres,
            "tags": tags,
            "studios": studios,
            "list_status": item["list_status"],
            "anilist_recs": anilist_recommendations, 
            "desirability": calculations.calculate_desirability(
                anime,
                max_popularity,
                anilist_recommendations,
                genres,
                tags,
                studios,
                directors,
                genre_affinities,
                tag_affinities,
                studio_affinities,
                director_affinities
            )
        })

    return {"last_updated": data["last_updated"], "planning_anime": anime_list}