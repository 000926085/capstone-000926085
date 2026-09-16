from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase_client import supabase
import requests
import functions.helpers as helpers
import functions.calculations as calculations
import queries as gql

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/import-anilist-user/{username}")
def import_anilist_user(username: str):
    # construct a supabase query to first check the database for a user.
    supabase_query = (
        supabase.table("users")
        .select("*", count="exact")
        .eq("username", username)
        .execute()
    )

    # call the api to fetch data if provided with a new or out-of-date (24 hrs) user.
    if supabase_query.count == 0 or helpers.hour_difference(supabase_query.data[0]["last_updated"]) >= 24:
        url = "https://graphql.anilist.co"
        response = requests.post(url, json={
            "query": gql.IMPORT_USER,
             "variables": {"username": username}
        })

        res_json = response.json()
        if "errors" in res_json or not res_json.get("data") or not res_json["data"].get("User"):
            raise HTTPException(status_code=404, detail="An AniList account with this username does not exist.")

        # retrieve fields from the data returned by the API.
        data = res_json["data"]
        avatar = data.get("User").get("avatar").get("large")
        user_avg = data.get("User").get("statistics").get("anime").get("meanScore")
        list_data = data.get("MediaListCollection").get("lists")

        # retrieve all anime from the user's list in preparation for storage.
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

        # postgres function for handling behaviour when provided with a user to setup.
        supabase.rpc(
            "user_setup",
            {
                "p_anime": all_anime,
                "p_username": username,
                "p_avatar": avatar
            }
        ).execute()

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
    supabase_query = (
        supabase.table("anime")
        .select("*", count="exact")
        .order("popularity", desc=True) 
        .limit(100)
        .execute()
    )

    return supabase_query.data