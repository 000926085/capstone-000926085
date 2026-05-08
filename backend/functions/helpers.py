from datetime import datetime, timezone

def format_date(date):
    """
    Consolidates the year, month and day of an anime into yyyy-mm-dd format.

    args:
        date: dict, contains the y, m, d values.
    returns:
        str, representation of a formatted date. 
    """
    if not date:
        return None
    
    year = date.get("year")
    month = date.get("month") 
    day = date.get("day")

    if not month or not day:
        return None

    return f"{year:04d}-{month:02d}-{day:02d}"

def hour_difference(timestamp):
    """
    Finds the difference between now and the last_updated timestamp of a user.

    args:
        timestamp: date, the last_updated field of a user.
    returns:
        float, hours between now and timestamp
    """
    now = datetime.now(timezone.utc)
    diff = now - datetime.fromisoformat(timestamp)

    return diff.total_seconds() / 3600