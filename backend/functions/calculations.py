import math

def category_mean(anime_list, category):
    """
    Calculates the mean and frequency of a category item based on the user scores of anime associated with the item.
    
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

            # dict, studios
            if isinstance(data, dict) and "edges" in data:
                for e in data.get("edges", []):
                    if e.get("isMain") and "node" in e:
                        node_name = e.get("node", {}).get("name")
                        if node_name:
                            items.append(node_name)

            # list, either genres or tags
            elif isinstance(data, list):
                for i in data:
                    # handle distinction between genres and tags
                    if isinstance(i, dict):
                        if not i.get("isAdult"):
                            items.append(i.get("name"))
                    else:
                        items.append(i)

            for name in items:
                # initialize object if a new key is encountered
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

    # ensure that k is scaled based on the average volume of this category.
    counts = [stats.get("count") for stats in category_dict.values()]
    avg_count = sum(counts) / len(counts) if counts else 1  
    k = max(2, avg_count * 0.25)

    for name, stats in category_dict.items():
        m, c = stats.get("mean"), stats.get("count")

        # as frequency increases, so does our trust.
        trust = c / (c + k) 
        weighted_score = (
            (m * 10) * trust
            + (user_avg - 2) * (1 - trust)
        )

        # check against a reduced baseline.
        deviation = weighted_score - (user_avg - 2) 

        # confine to a 0.5x to 1.5x range.
        multiplier = round(
            max(0.5, min(1.5, 1.0 + (deviation / 100) * 3.0)),
            3
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


def calculate_desirability(anime, max_popularity, anilist_recommendations):
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

    total_score = base_score + recommendation_bonus_points

    return {
        "base_score": round(base_score, 4),
        "recommendation_bonus": round(recommendation_bonus_points, 4),
        "total_score": round(total_score, 2)
    }