from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
