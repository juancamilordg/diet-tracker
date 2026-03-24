from db.connection import get_db
from db.goals import get_goals
from db.water import get_water_today


async def get_day_summary(user_id: int = 1, date: str | None = None) -> dict:
    """Return aggregated macro totals for a given date (defaults to today)."""
    date_expr = "date(?)" if date else "date('now')"
    params = (user_id, date) if date else (user_id,)

    async with get_db() as db:
        cursor = await db.execute(
            f"""
            SELECT
                COALESCE(SUM(calories), 0)   AS total_calories,
                COALESCE(SUM(protein_g), 0)  AS total_protein_g,
                COALESCE(SUM(carbs_g), 0)    AS total_carbs_g,
                COALESCE(SUM(fat_g), 0)      AS total_fat_g,
                COALESCE(SUM(fiber_g), 0)    AS total_fiber_g,
                COALESCE(SUM(sodium_mg), 0)  AS total_sodium_mg,
                COUNT(*)                      AS meal_count
            FROM meals
            WHERE user_id = ? AND date(logged_at) = {date_expr}
            """,
            params,
        )
        row = await cursor.fetchone()
        return dict(row) if row else {
            "total_calories": 0,
            "total_protein_g": 0,
            "total_carbs_g": 0,
            "total_fat_g": 0,
            "total_fiber_g": 0,
            "meal_count": 0,
        }


# Keep old name as alias for bot handlers
async def get_today_summary(user_id: int = 1) -> dict:
    return await get_day_summary(user_id)


async def get_weekly_data(user_id: int = 1, date: str | None = None) -> list[dict]:
    """Return daily aggregates for 7 days ending on the given date."""
    if date:
        date_filter = "date(logged_at) >= date(?, '-6 days') AND date(logged_at) <= date(?)"
        params = (user_id, date, date)
    else:
        date_filter = "date(logged_at) >= date('now', '-6 days')"
        params = (user_id,)

    async with get_db() as db:
        cursor = await db.execute(
            f"""
            SELECT
                date(logged_at) AS date,
                COALESCE(SUM(calories), 0)   AS total_calories,
                COALESCE(SUM(protein_g), 0)  AS total_protein_g,
                COALESCE(SUM(carbs_g), 0)    AS total_carbs_g,
                COALESCE(SUM(fat_g), 0)      AS total_fat_g,
                COUNT(*)                      AS meal_count
            FROM meals
            WHERE user_id = ? AND {date_filter}
            GROUP BY date(logged_at)
            ORDER BY date(logged_at) ASC
            """,
            params,
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_last_meal(user_id: int = 1, date: str | None = None) -> dict | None:
    """Return the last meal logged on a given date (defaults to today)."""
    date_expr = "date(?)" if date else "date('now')"
    params = (user_id, date) if date else (user_id,)
    query = f"SELECT * FROM meals WHERE user_id = ? AND date(logged_at) = {date_expr} ORDER BY logged_at DESC LIMIT 1"

    async with get_db() as db:
        cursor = await db.execute(query, params)
        row = await cursor.fetchone()
        return dict(row) if row else None


async def get_dashboard_data(user_id: int = 1, date: str | None = None) -> dict:
    """Combine day summary, goals, last meal, weekly data, and water for a user."""
    day_summary = await get_day_summary(user_id, date)
    goals = await get_goals(user_id)
    last_meal = await get_last_meal(user_id, date)
    weekly_data = await get_weekly_data(user_id, date)
    water_today = await get_water_today(user_id)

    return {
        "today_summary": day_summary,
        "goals": goals,
        "last_meal": last_meal,
        "weekly_data": weekly_data,
        "water_today": water_today,
    }
