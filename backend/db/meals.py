from db.connection import get_db


def _serialize(d: dict) -> dict:
    """Convert datetime values to ISO strings for JSON serialization."""
    return {k: v.isoformat() if hasattr(v, 'isoformat') else v for k, v in d.items()}


async def create_meal(data: dict, user_id: int = 1) -> dict:
    """INSERT a new meal and return the created row as a dict."""
    data["user_id"] = user_id
    columns = list(data.keys())
    col_names = ", ".join(columns)
    placeholders = ", ".join(["%s"] * len(columns))
    values = [data[c] for c in columns]

    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                f"INSERT INTO meals ({col_names}) VALUES ({placeholders}) RETURNING *",
                values,
            )
            row = await cur.fetchone()
            return _serialize(row)


async def get_meal(meal_id: int) -> dict | None:
    """SELECT a single meal by id."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM meals WHERE id = %s", (meal_id,))
            row = await cur.fetchone()
            return _serialize(row) if row else None


async def get_meals(
    user_id: int = 1,
    limit: int = 50,
    offset: int = 0,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[dict]:
    """SELECT meals for a user with optional date filtering, ordered by logged_at DESC."""
    conditions: list[str] = ["user_id = %s"]
    params: list = [user_id]

    if date_from:
        conditions.append("logged_at::date >= %s::date")
        params.append(date_from)
    if date_to:
        conditions.append("logged_at::date <= %s::date")
        params.append(date_to)

    where = " AND ".join(conditions)
    params.extend([limit, offset])
    query = f"SELECT * FROM meals WHERE {where} ORDER BY logged_at DESC LIMIT %s OFFSET %s"

    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(query, params)
            rows = await cur.fetchall()
            return [_serialize(r) for r in rows]


async def update_meal(meal_id: int, data: dict) -> dict | None:
    """UPDATE a meal and return the updated row."""
    if not data:
        return await get_meal(meal_id)

    set_parts = [f"{k} = %s" for k in data.keys()]
    values = list(data.values()) + [meal_id]
    set_clause = ", ".join(set_parts)

    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                f"UPDATE meals SET {set_clause}, updated_at = NOW() WHERE id = %s RETURNING *",
                values,
            )
            row = await cur.fetchone()
            return _serialize(row) if row else None


async def delete_meal(meal_id: int) -> bool:
    """DELETE a meal. Returns True if a row was deleted."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM meals WHERE id = %s", (meal_id,))
            return cur.rowcount > 0
