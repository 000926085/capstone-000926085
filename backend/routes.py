import logging
from logging.handlers import RotatingFileHandler
import trace
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase_client import supabase
import requests
import functions.helpers as helpers
import functions.calculations as calculations
import queries as gql

logger = logging.getLogger("app_logger")
logger.setLevel(logging.ERROR)

file_handler = RotatingFileHandler("error.log", maxBytes=5_000_000, backupCount=1)
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

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
    """
    Checks the Supabase database to verify if a user exists and that their data has been updated within the past 24 hours.
    If the user is missing or has stale data, query the AniList API, parse the list data and run the 'user_setup' database function. 

    args:
        username (str): the AniList username to import.
    
    returns:
        dict: a status message indicating whether the user was imported or already up to date.

    raises:
        502: If the AniList GraphQL query fails.
        404: If the AniList account does not exist.
    """
    # Construct a supabase query to first check the database for a user.
    supabase_query = (
        supabase.table("users")
        .select("*", count="exact")
        .eq("username", username)
        .execute()
    )

    # Call the api to fetch data if provided with a new or out-of-date (24 hrs) user.
    if supabase_query.count == 0 or helpers.hour_difference(supabase_query.data[0]["last_updated"]) >= 24:
        url = "https://graphql.anilist.co"

        try:
            response = requests.post(url, json={
                "query": gql.IMPORT_USER,
                "variables": {"username": username}
            })
            response.raise_for_status()
        except requests.RequestException as e:
            logger.error(f"AniList API error for user '{username}': {str(e)}")
            raise HTTPException(status_code=502, detail="Failed to communicate with AniList servers.")

        res_json = response.json()
        if "errors" in res_json or not res_json.get("data") or not res_json["data"].get("User"):
            raise HTTPException(status_code=404, detail="An AniList account with this username does not exist.")

        # Retrieve fields from the data returned by the API.
        data = res_json["data"]
        avatar = data.get("User").get("avatar").get("large")
        user_avg = data.get("User").get("statistics").get("anime").get("meanScore")
        list_data = data.get("MediaListCollection").get("lists")

        # Retrieve all anime from the user's list in preparation for storage.
        all_anime = [
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

        try:
            # Postgres function for handling behaviour when provided with a user to setup.
            supabase.rpc(
                "user_setup",
                {
                    "p_anime": all_anime,
                    "p_username": username,
                    "p_avatar": avatar
                }
            ).execute()
        except Exception as e:
            logger.error(f"Supabase RPC 'user_setup' failed for '{username}': {str(e)}")
            raise

        return {"status": "success", "message": f"User {username} successfully imported."};
    else:
        return {"status": "success", "message": f"User {username} is up to date."
    }

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
        .limit(100)
        .execute()
    )

    return supabase_query.data

@app.get("/api/fetch-planning-data/{username}")
def fetch_planning_data(username: str):
    user_res = (
        supabase.table("users")
        .select("user_id", count="exact")
        .eq("username", username)
        .maybe_single()
        .execute()
    )

    if not user_res or not user_res.data:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found.")
    user_id = user_res.data["user_id"]

    planning_res = (
        supabase.table("users_anime")
        .select("anime(*)")
        .eq("user_id", user_id)
        .eq("list_status", "PLANNING")
        .execute()
    )

    anime_list = [item["anime"] for item in planning_res.data if item.get("anime")]
    return {"username": username, "planning_anime": anime_list}


@app.get("/api/fetch-anime-list/{username}")
def fetch_anime_list(username: str):
    user_res = (
        supabase.table("users")
        .select("user_id", count="exact")
         .eq("username", username)
        .maybe_single()
        .execute()
    )

    if not user_res or not user_res.data:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found.")
    user_id = user_res.data["user_id"]

    anime_list_res = (
        supabase.table("users_anime")
        .select("list_status, score, anime(*)")
        .eq("user_id", user_id)
        .execute()
    )

    anime_list = []
    for item in anime_list_res.data or []:
        anime_data = item.get("anime")

        if anime_data:
            # add the user-specific data from users_anime.
            anime_data = {
                **anime_data,
                "score": item.get("score"),
                "list_status": item.get("list_status")
            }
            anime_list.append(anime_data)

    return {"username": username, "anime": anime_list}