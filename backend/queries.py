FETCH_ANIME = """
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

USER_EXISTS = """
query ($username: String) {
    User (name: $username) {
        __typename
    }
}
"""