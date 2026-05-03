def category_mean(animeList, category):
    """
    Calculates the mean and frequency of a category item based on the user scores of anime associated with the item.
    
    args:
        animeList: arr, contains all anime within a user's list.
        category: str, the field we are finding the means for.
    returns:
        dict containing the mean and amount of times the item appeared within animeList.
    """
    scores = {}

    for a in animeList:
        score = a.get("user_score", 0)
        if score != 0:

            data = a.get(category, [])
            items = []

            # dict, studios
            if isinstance(data, dict) and "edges" in data:
                for e in data.get("edges", []):
                    if e.get("isMain") and "node" in e:
                        items.append(e.get("node").get("name"))

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