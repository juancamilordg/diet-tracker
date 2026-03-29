from db.connection import get_db
from db.goals import get_goals


def _serialize(d: dict) -> dict:
    return {k: v.isoformat() if hasattr(v, 'isoformat') else v for k, v in d.items()}


async def log_water(user_id: int = 1, amount_ml: int = 0, logged_at: str | None = None) -> dict:
    """INSERT a water log entry and return it."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            if logged_at:
                await cur.execute(
                    "INSERT INTO water_log (user_id, amount_ml, logged_at) VALUES (%s, %s, %s) RETURNING *",
                    (user_id, amount_ml, logged_at),
                )
            else:
                await cur.execute(
                    "INSERT INTO water_log (user_id, amount_ml) VALUES (%s, %s) RETURNING *",
                    (user_id, amount_ml),
                )
            row = await cur.fetchone()
            return _serialize(row)


async def get_water_today(user_id: int = 1, date: str | None = None) -> dict:
    """Return total water intake, target, and individual entries for a user on a given date."""
    goals = await get_goals(user_id)
    target_ml = goals.get("water_target_ml", 3500)

    date_filter = "logged_at::date = %s::date" if date else "logged_at::date = CURRENT_DATE"
    params_single = (user_id, date) if date else (user_id,)
    params_list = (user_id, date) if date else (user_id,)

    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                f"SELECT COALESCE(SUM(amount_ml), 0) AS total_ml "
                f"FROM water_log WHERE user_id = %s AND {date_filter}",
                params_single,
            )
            total_row = await cur.fetchone()
            total_ml = total_row["total_ml"] if total_row else 0

            await cur.execute(
                f"SELECT * FROM water_log WHERE user_id = %s AND {date_filter} "
                f"ORDER BY logged_at DESC",
                params_list,
            )
            entries = await cur.fetchall()

            return {
                "total_ml": total_ml,
                "target_ml": target_ml,
                "entries": [_serialize(e) for e in entries],
            }
