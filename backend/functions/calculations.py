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
        
        trust = c / (c + k) # as frequency increases, so does our trust.
        weighted_score = ((m * 10) * trust) + ((user_avg - 2) * (1 - trust))  
        deviation = weighted_score - (user_avg - 2) # check against a reduced baseline.
        multiplier = round(max(0.5, min(1.5, 1.0 + (deviation / 100) * 3.0)), 3) # confine to a 0.5x to 1.5x range.

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