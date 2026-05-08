from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase_client import supabase
import requests
import functions.helpers as helpers
import functions.calculations as calculations

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
    supabase_query = (
        supabase.table("users")
        .select("*", count="exact")
        .eq("username", username)
        .execute()
    )

    user_last_updated = helpers.hour_difference(supabase_query.data[0]["last_updated"])

    # call the api if provided with a new or out-of-date user
    if supabase_query.count == 0 or user_last_updated >= 24:
        myQuery = """
        query MyQuery ($username: String) {
            User (name: $username) {
                avatar {
                    large
                }
                statistics {
                    anime {
                        meanScore
                    }
                }
            }
            MediaListCollection (userName: $username, type: ANIME, status_not: REPEATING) {
                lists {
                    isCustomList
                    entries {
                        media {
                            title {
                                english
                                romaji
                            }
                            genres
                            tags {
                                name
                                isAdult
                                rank
                            }
                            studios {
                                edges {
                                    node {
                                        name
                                    }
                                    isMain
                                }
                            }
                            id
                            format
                            episodes
                            status
                            startDate {
                                year
                                month
                                day
                            }
                            endDate {
                                year
                                month
                                day
                            }
                            meanScore
                            popularity
                            source
                            status
                        }
                        status
                        score
                    }
                }
            }
        }
        """

        url = "https://graphql.anilist.co"
        response = requests.post(url, json={
            "query": myQuery,
            "variables": {"username": username}
        })

        data = response.json().get("data")
        if data.get("User") is None:
            return {
                "content": None,
                "message": f"An AniList account with the username {username} could not be found."
            }

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
                "endDate": helpers.format_date(entry["media"].get("endDate"))
            }
            for c in list_data if not c.get("isCustomList")
            for entry in c.get("entries", [])
            if entry.get("media", {}).get("status") != "NOT_YET_RELEASED"
        ]

        # postgres function for handling behaviour when provided with a new user. 
        supabase.rpc(
            "user_setup",
            {
                "p_anime": all_anime,
                "p_username": username,
                "p_avatar": avatar
            }
        ).execute()

        return {
            "content": all_anime,
            "message": f"{username} has been added to the database!"
        }
    else:
        return {
            "content": supabase_query.data[0]["last_updated"],
            "message": f"{username}'s record already exists!"
        }

@app.get("/api/fetch-users")
def fetch_users():
    return (
        supabase.table("users")
        .select("*", count="exact")
        .execute()
    )

@app.post("/api/insert-anime")
def insert_anime(anime: list[dict]):
    return (
        supabase
        .table("anime")
        .upsert(anime, on_conflict="anilist_id")
        .execute()
    )

@app.get("/api/fetch-anime/{anilist_id}")
def fetch_anime(anilist_id: int):
    myQuery = """
    query ($anilist_id: Int) {
        Media (id: $anilist_id) {
            id
            title {
                english
                romaji
            }
            format
            episodes
            status
            startDate {
                year
                month
                day
            }
            endDate {
                year
                month
                day
            }
            meanScore
            popularity
            source
        }
    }
    """

    url = "https://graphql.anilist.co"
    response = requests.post(url, json={
        "query": myQuery,
        "variables": {"anilist_id": anilist_id}
    })

    return response.json()
