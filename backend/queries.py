""" Retrieves basic profile data and information pertaining to every anime within a user's list. """
IMPORT_USER = """
query MyQuery ($username: String) {
    User (name: $username) {
        __typename
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
                    coverImage {
                        large
                    }
                }
                status
                score
            }
        }
    }
}
"""

""" Simple query to check if an AniList account with the provided username exists. """
USER_EXISTS = """
query ($username: String) {
    User (name: $username) {
        __typename
    }
}
"""