from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo, available_timezones

from fastapi import Depends, HTTPException, Request

from db.users import get_all_users, get_user

_first_user_cache: int | None = None


async def get_current_user_id(request: Request) -> int:
    """Extract user ID from X-User-ID header. Falls back to first user in DB."""
    global _first_user_cache
    header = request.headers.get("X-User-ID", "0")
    try:
        uid = int(header)
    except (ValueError, TypeError):
        uid = 0

    if uid > 0:
        return uid

    # Fallback: return the first user
    if _first_user_cache is None:
        users = await get_all_users()
        if users:
            _first_user_cache = users[0]["id"]
        else:
            _first_user_cache = 1
    return _first_user_cache


@dataclass
class UserDateInfo:
    timezone: str
    today: str


async def get_user_timezone(
    request: Request, user_id: int = Depends(get_current_user_id)
) -> UserDateInfo:
    """Resolve the user's timezone and compute their local 'today' date."""
    tz_header = request.headers.get("X-Timezone")
    if tz_header and tz_header in available_timezones():
        tz = tz_header
    else:
        user = await get_user(user_id)
        tz = (user or {}).get("timezone", "Europe/London")
    today = datetime.now(ZoneInfo(tz)).strftime("%Y-%m-%d")
    return UserDateInfo(timezone=tz, today=today)


def validate_date_param(date_str: str, user_today: str) -> str:
    """Parse and validate a date string. Raises 422 for bad format or future dates."""
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid date format: {date_str!r}. Expected YYYY-MM-DD.")
    if date_str > user_today:
        raise HTTPException(status_code=422, detail="Cannot log or view data for future dates.")
    return date_str
