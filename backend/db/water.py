from db.connection import get_db
from db.goals import get_goals


def _serialize(d: dict) -> dict:
    return {k: v.isoformat() if hasattr(v, 'isoformat') else v for k, v in d.items()}


async def log_water(user_id: int = 1, amount_ml: int = 0) -> dict:
    """INSERT a water log entry and return it."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO water_log (user_id, amount_ml) VALUES (%s, %s) RETURNING *",
                (user_id, amount_ml),
            )
            row = await cur.fetchone()
            return _serialize(row)


async def get_water_today(user_id: int = 1) -> dict:
    """Return today's total water intake, target, and individual entries for a user."""
    goals = await get_goals(user_id)
    target_ml = goals.get("water_target_ml", 3500)

    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT COALESCE(SUM(amount_ml), 0) AS total_ml "
                "FROM water_log WHERE user_id = %s AND logged_at::date = CURRENT_DATE",
                (user_id,),
            )
            total_row = await cur.fetchone()
            total_ml = total_row["total_ml"] if total_row else 0

            await cur.execute(
                "SELECT * FROM water_log WHERE user_id = %s AND logged_at::date = CURRENT_DATE "
                "ORDER BY logged_at DESC",
                (user_id,),
            )
            entries = await cur.fetchall()

            return {
                "total_ml": total_ml,
                "target_ml": target_ml,
                "entries": [_serialize(e) for e in entries],
            }
