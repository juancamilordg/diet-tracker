from db.connection import get_db
from db.goals import get_goals


async def log_water(user_id: int = 1, amount_ml: int = 0) -> dict:
    """INSERT a water log entry and return it."""
    async with get_db() as db:
        cursor = await db.execute(
            "INSERT INTO water_log (user_id, amount_ml) VALUES (?, ?)",
            (user_id, amount_ml),
        )
        await db.commit()
        entry_id = cursor.lastrowid

        row = await db.execute("SELECT * FROM water_log WHERE id = ?", (entry_id,))
        result = await row.fetchone()
        return dict(result)


async def get_water_today(user_id: int = 1) -> dict:
    """Return today's total water intake, target, and individual entries for a user."""
    goals = await get_goals(user_id)
    target_ml = goals.get("water_target_ml", 3500)

    async with get_db() as db:
        # Total for today
        cursor = await db.execute(
            "SELECT COALESCE(SUM(amount_ml), 0) AS total_ml "
            "FROM water_log WHERE user_id = ? AND date(logged_at) = date('now')",
            (user_id,),
        )
        total_row = await cursor.fetchone()
        total_ml = total_row["total_ml"] if total_row else 0

        # Individual entries for today
        cursor = await db.execute(
            "SELECT * FROM water_log WHERE user_id = ? AND date(logged_at) = date('now') "
            "ORDER BY logged_at DESC",
            (user_id,),
        )
        entries = await cursor.fetchall()

        return {
            "total_ml": total_ml,
            "target_ml": target_ml,
            "entries": [dict(e) for e in entries],
        }
