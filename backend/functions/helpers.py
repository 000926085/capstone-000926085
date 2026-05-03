def format_date(date):
    """
    Consolidates the year, month and day of an anime into yyyy-mm-dd format.

    args:
        date: dict, contains the y, m, d values.
    returns:
        str representation of a formatted date. 
    """
    if not date:
        return None
    
    year = date.get("year")
    month = date.get("month") 
    day = date.get("day")

    if not month or not day:
        return None

    return f"{year:04d}-{month:02d}-{day:02d}"