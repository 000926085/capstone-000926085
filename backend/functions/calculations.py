import math

def category_mean(anime_list, category):
    """
    Calculates the mean and frequency of a category item based on the user scores
    of anime associated with the item.

    args:
        anime_list: arr, contains all anime within a user's list.
        category: str, the field we are finding the means for.
    returns:
        dict containing the mean and amount of times the item appeared within anime_list.
    """
    scores = {}

    for a in anime_list:
        score = a.get("user_score", 0)

        if score != 0:
            data = a.get(category, [])
            items = []

            # Dict, studios or staff
            if isinstance(data, dict) and "edges" in data:
                for e in data.get("edges", []):
                    if "node" not in e:
                        continue

                    # Staff contains multiple roles, so only include directors.
                    if category == "staff":
                        if e.get("role") != "Director":
                            continue

                        name_data = e.get("node", {}).get("name", {})
                        node_name = " ".join(
                            part for part in [
                                name_data.get("first"),
                                name_data.get("last")
                            ]
                            if part
                        )

                    # Studios only include the main studio.
                    elif category == "studios":
                        if not e.get("isMain"):
                            continue

                        node_name = e.get("node", {}).get("name")

                    if node_name:
                        items.append(node_name)

            # List, either genres or tags
            elif isinstance(data, list):
                for i in data:
                    if isinstance(i, dict):
                        if not i.get("isAdult"):
                            items.append(i.get("name"))
                    else:
                        items.append(i)

            for name in items:
                if name not in scores:
                    scores[name] = []

                scores[name].append(score)

    return {
        name: {
            "mean": round(sum(vals) / len(vals), 2),
            "count": len(vals)
        }
        for name, vals in scores.items()
    }

def affinity_score(anime_list, category, user_avg, entity_key):
    """
    Calculates an affinity score for each item of a category based on a user's watch history.
    Liked items are boosted, disliked are lowered and new or average items remain neutral.

    args:
        anime_list: dict, parsed anime objects from user's watch history.
        category: str, the category that we are finding affinity scores for.
        user_avg: float, a user's mean score across all rated anime within their list.
        entity_key: str, singular JSON key name.
    returns:
        list containing the affinity data, formatted for database storage.
    """
    category_dict = category_mean(anime_list, category)
    if not category_dict:
        return {}

    affinities = []

    # Ensure that k is scaled based on the average volume of this category.
    counts = [stats.get("count") for stats in category_dict.values()]
    avg_count = sum(counts) / len(counts) if counts else 1  
    k = max(2, avg_count * 0.25)

    for name, stats in category_dict.items():
        m, c = stats.get("mean"), stats.get("count")

        # As frequency increases, so does our trust.
        trust = c / (c + k) 
        weighted_score = (
            (m * 10) * trust
            + (user_avg - 2) * (1 - trust)
        )

        # Check against a reduced baseline.
        deviation = weighted_score - (user_avg - 2) 

        # Confine to a 0.5x to 1.5x range.
        multiplier = round(
            max(0.5, min(1.5, 1.0 + (deviation / 100) * 3.0)), 3
        )

        affinities.append(
            {
                entity_key: name,
                "affinity": {
                    "multiplier": multiplier,
                    "score": round(weighted_score, 2),
                    "mean": m,
                    "count": c
                }
            }
        )

    return affinities

def recommendation_bonus(recommendations):
    """
    Awards bonus points according to a user's association with the recommendations on an anime's AniList page to be applied to the final calculation.
    
    args:
        recs (list): contains the rank of an anime in terms of similarity, and if applicable, the score and list status a user has for this anime.
    returns:
        float: the points awarded for the recommendations.
    """

    points = 0
    rank_weights = { 1: 1.0, 2: 0.9, 3: 0.8,  4: 0.7,  5: 0.6 }
    status_weights = { "COMPLETED": 1.0, "REPEATING": 0.75, "CURRENT": 0.5, "PAUSED": 0.25, "PLANNING": 0.0, "DROPPED": -1.0}

    for rec in recommendations:
        score, rank, status = rec["score"], rec["rank"], rec["status"]
        rank_weight = rank_weights.get(rank, 0)

        # A score provides positive or negative evidence depending on how the user rated it, relative to it's rank.
        if score is not None and score > 0:
            if score >= 5:
                score_points = score
            else:
                score_points = -(5 - score) * 0.5

            points += score_points * rank_weight

        # If no score was given, rely on the list statuses as a weaker source of evidence.
        else:
            status_weight = status_weights.get(status, 0)
            points += status_weight * 5 * rank_weight

    return points

def calculate_category_affinity(items, affinities, use_similarity=False):
    """
    Determines the multiplier for the total score using the affinity value of a category.

    args:
        items (list): the items that belong to a given category, associated with a given anime.
        affinities (dict): affinity values for a given category.
        use_similarity (boolean): flag for determining if we're calculating on tags or not.
    returns:
        float representing a multiplier for a category.
    """
    if not items: return 1.0

    # Use the existing affinities to establish a basline for unknown genres.
    known_affinities = list(affinities.values())
    fallback = (
        sum(known_affinities) / len(known_affinities)
        if known_affinities else 1.0
    )

    weighted_affinities = []
    for item in items:
        # Genres and studios are simple strings. 
        if isinstance(item, str): 
            name, similarity = item, 100

        # Tags contain a name and similarity value.
        else:
            name, similarity = item["name"], item.get("similarity") or 0

        # Look up the user's affinity for this item. 
        affinity = affinities.get(name, fallback)

        # For tags, consider how strongly AniList associates a tag with this anime.
        if use_similarity:
            similarity_weight = similarity / 100 
            weighted_affinity = ( 
                1.0 + (affinity - 1.0) * similarity_weight 
            )
        else:
            weighted_affinity = affinity

        weighted_affinities.append(weighted_affinity)

    # Calculate the average affinity across all items.
    average_affinity = sum(weighted_affinities) / len(weighted_affinities)

    # Reward multiple, strong matches with diminishing returns.
    bonus = 1 + 0.05 * math.log(len(weighted_affinities))
    
    return average_affinity * bonus

def calculate_desirability(
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
):
    mean_score = anime.get("mean_score") or 0
    popularity = anime.get("popularity") or 1
    
    # Mean score has an 80% weight, whereas popularity has a 20% weight.
    base_score = (
        0.8 * mean_score
        + 0.2 * (100 * math.sqrt (
            math.log(popularity + 1) /
            math.log(max_popularity + 1)
        )
    ))

    # Has the user enjoyed other anime found to be similar to this one? 
    recommendation_bonus_points = recommendation_bonus(anilist_recommendations) 

    # How do this anime's genres match with the user's preferences?
    genre_multiplier = calculate_category_affinity(genres, genre_affinities)

    # How do this anime's studios match with the user's preferences?
    studio_multiplier = calculate_category_affinity(studios, studio_affinities)

    # How do this anime's tags match with the user's preferences?
    tag_multiplier = calculate_category_affinity(tags, tag_affinities, True)

    # How do this anime's directors match with the user's preferences?
    director_multiplier = calculate_category_affinity(directors, director_affinities)

    # Combine the affinity signals, according to their hierarchy.
    affinity_multiplier = (
        1.0
        + 0.40 * (genre_multiplier - 1.0)
        + 0.30 * (tag_multiplier - 1.0)
        + 0.15 * (studio_multiplier - 1.0)
        + 0.15 * (director_multiplier - 1.0)
    )

    # Calculate the final score used to sort the anime on the frontend.
    total_score = (
        (base_score * affinity_multiplier)
        + (recommendation_bonus_points * 0.75)
    )

    return {
        "base_score": round(base_score, 4),
        "recommendation_bonus": round(recommendation_bonus_points, 4),
        "genre_multiplier": round(genre_multiplier, 4),
        "tag_multiplier": round(tag_multiplier, 4),
        "studio_multiplier": round(studio_multiplier, 4),
        "affinity_multiplier": round(affinity_multiplier, 4),
        "director_multiplier": round(director_multiplier, 4),
        "total_score": round(total_score, 2)
    }