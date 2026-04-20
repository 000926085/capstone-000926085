def format_date(date):
    if not date:
        return None
    
    year = date.get("year")
    month = date.get("month") 
    day = date.get("day")

    if not month or not day:
        return None

    return f"{year:04d}-{month:02d}-{day:02d}"