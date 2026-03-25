from db.connection import get_db
from db.goals import get_goals


def _row_to_dict(row) -> dict:
    d = dict(row)
    for k, v in d.items():
        if hasattr(v, 'isoformat'):
            d[k] = v.isoformat()
    return d


async def log_water(user_id: int = 1, amount_ml: int = 0) -> dict:
    """INSERT a water log entry and return it."""
    async with get_db() as conn:
        row = await conn.fetchrow(
            "INSERT INTO water_log (user_id, amount_ml) VALUES ($1, $2) RETURNING *",
            user_id, amount_ml,
        )
        return _row_to_dict(row)


async def get_water_today(user_id: int = 1) -> dict:
    """Return today's total water intake, target, and individual entries for a user."""
    goals = await get_goals(user_id)
    target_ml = goals.get("water_target_ml", 3500)

    async with get_db() as conn:
        total_row = await conn.fetchrow(
            "SELECT COALESCE(SUM(amount_ml), 0) AS total_ml "
            "FROM water_log WHERE user_id = $1 AND logged_at::date = CURRENT_DATE",
            user_id,
        )
        total_ml = total_row["total_ml"] if total_row else 0

        entries = await conn.fetch(
            "SELECT * FROM water_log WHERE user_id = $1 AND logged_at::date = CURRENT_DATE "
            "ORDER BY logged_at DESC",
            user_id,
        )

        return {
            "total_ml": total_ml,
            "target_ml": target_ml,
            "entries": [_row_to_dict(e) for e in entries],
        }
