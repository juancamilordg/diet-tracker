from db.connection import get_db
from db.goals import get_goals
from db.water import get_water_today


def _serialize(d: dict) -> dict:
    return {k: v.isoformat() if hasattr(v, 'isoformat') else v for k, v in d.items()}


async def get_day_summary(user_id: int, date: str) -> dict:
    """Return aggregated macro totals for a given date."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT
                    COALESCE(SUM(calories), 0)   AS total_calories,
                    COALESCE(SUM(protein_g), 0)  AS total_protein_g,
                    COALESCE(SUM(carbs_g), 0)    AS total_carbs_g,
                    COALESCE(SUM(fat_g), 0)      AS total_fat_g,
                    COALESCE(SUM(fiber_g), 0)    AS total_fiber_g,
                    COALESCE(SUM(sodium_mg), 0)  AS total_sodium_mg,
                    COUNT(*)                      AS meal_count
                FROM meals
                WHERE user_id = %s AND logged_at::date = %s::date
                """,
                (user_id, date),
            )
            row = await cur.fetchone()
            return dict(row) if row else {
                "total_calories": 0,
                "total_protein_g": 0,
                "total_carbs_g": 0,
                "total_fat_g": 0,
                "total_fiber_g": 0,
                "meal_count": 0,
            }


async def get_weekly_data(user_id: int, date: str) -> list[dict]:
    """Return daily aggregates for 7 days ending on the given date."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT
                    logged_at::date AS date,
                    COALESCE(SUM(calories), 0)   AS total_calories,
                    COALESCE(SUM(protein_g), 0)  AS total_protein_g,
                    COALESCE(SUM(carbs_g), 0)    AS total_carbs_g,
                    COALESCE(SUM(fat_g), 0)      AS total_fat_g,
                    COUNT(*)                      AS meal_count
                FROM meals
                WHERE user_id = %s
                  AND logged_at::date >= (%s::date - INTERVAL '6 days')::date
                  AND logged_at::date <= %s::date
                GROUP BY logged_at::date
                ORDER BY logged_at::date ASC
                """,
                (user_id, date, date),
            )
            rows = await cur.fetchall()
            return [_serialize(r) for r in rows]


async def get_last_meal(user_id: int, date: str) -> dict | None:
    """Return the last meal logged on a given date."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT * FROM meals WHERE user_id = %s AND logged_at::date = %s::date ORDER BY logged_at DESC LIMIT 1",
                (user_id, date),
            )
            row = await cur.fetchone()
            return _serialize(row) if row else None


async def get_dashboard_data(user_id: int, date: str) -> dict:
    """Combine day summary, goals, last meal, weekly data, and water for a user."""
    day_summary = await get_day_summary(user_id, date)
    goals = await get_goals(user_id)
    last_meal = await get_last_meal(user_id, date)
    weekly_data = await get_weekly_data(user_id, date)
    water_today = await get_water_today(user_id, date)

    return {
        "today_summary": day_summary,
        "goals": goals,
        "last_meal": last_meal,
        "weekly_data": weekly_data,
        "water_today": water_today,
    }
