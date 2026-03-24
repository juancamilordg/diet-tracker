from fastapi import Request

from db.users import get_all_users

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
