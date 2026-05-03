def category_mean(animeList, category):
    scores = {}

    for a in animeList:
        score = a.get("user_score", 0)
        if score != 0:
            for c in a.get(category, []):
                if isinstance(c, dict):
                    if c.get("isAdult"):
                        continue
                    name = c.get("name")
                else:
                    name = c
            
                if name not in scores:
                    scores[name] = []
                scores[name].append(score)

    return {
        item: {
            "mean": round(sum(vals) / len(vals), 2),
            "count": len(vals)
        }
        for item, vals in scores.items()
    }