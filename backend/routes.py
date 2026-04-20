from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase_client import supabase
import requests
import helpers

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
    myQuery = """
    query MyQuery ($username: String) {
        User (name: $username) {
            avatar {
                large
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
    avatar = data.get("User").get("avatar").get("large")
    list_data = data.get("MediaListCollection").get("lists")

    all_anime = []
    for c in list_data:
        if not c.get("isCustomList"):
            for entry in c.get("entries", []):
                if entry.get("media", {}).get("status") != "NOT_YET_RELEASED":
                    media = entry.get("media")

                    start = helpers.format_date(media.get("startDate"))
                    end = helpers.format_date(media.get("endDate"))
                    anilist_id = media.pop("id", None)

                    anime_record = {
                        **media,
                        "anilist_id": anilist_id,
                        "startDate": start,
                        "endDate": end
                    }

                    all_anime.append(anime_record)

    supabase.rpc(
        "user_setup",
        {
            "p_anime": all_anime,
            "p_username": username,
            "p_avatar": avatar
        }
    ).execute()

    return all_anime

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
