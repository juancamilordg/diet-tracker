from db.connection import get_db


def _row_to_dict(row) -> dict:
    """Convert an asyncpg Record to a dict with string datetimes."""
    d = dict(row)
    for k, v in d.items():
        if hasattr(v, 'isoformat'):
            d[k] = v.isoformat()
    return d


async def create_meal(data: dict, user_id: int = 1) -> dict:
    """INSERT a new meal and return the created row as a dict."""
    data["user_id"] = user_id
    columns = list(data.keys())
    col_names = ", ".join(columns)
    placeholders = ", ".join([f"${i+1}" for i in range(len(columns))])
    values = [data[c] for c in columns]

    async with get_db() as conn:
        row = await conn.fetchrow(
            f"INSERT INTO meals ({col_names}) VALUES ({placeholders}) RETURNING *",
            *values,
        )
        return _row_to_dict(row)


async def get_meal(meal_id: int) -> dict | None:
    """SELECT a single meal by id."""
    async with get_db() as conn:
        row = await conn.fetchrow("SELECT * FROM meals WHERE id = $1", meal_id)
        return _row_to_dict(row) if row else None


async def get_meals(
    user_id: int = 1,
    limit: int = 50,
    offset: int = 0,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[dict]:
    """SELECT meals for a user with optional date filtering, ordered by logged_at DESC."""
    conditions: list[str] = ["user_id = $1"]
    params: list = [user_id]
    idx = 2

    if date_from:
        conditions.append(f"logged_at::date >= ${ idx}::date")
        params.append(date_from)
        idx += 1
    if date_to:
        conditions.append(f"logged_at::date <= ${idx}::date")
        params.append(date_to)
        idx += 1

    where = " AND ".join(conditions)
    params.extend([limit, offset])
    query = f"SELECT * FROM meals WHERE {where} ORDER BY logged_at DESC LIMIT ${idx} OFFSET ${idx+1}"

    async with get_db() as conn:
        rows = await conn.fetch(query, *params)
        return [_row_to_dict(r) for r in rows]


async def update_meal(meal_id: int, data: dict) -> dict | None:
    """UPDATE a meal and return the updated row."""
    if not data:
        return await get_meal(meal_id)

    set_parts = []
    values = []
    for i, (k, v) in enumerate(data.items(), 1):
        set_parts.append(f"{k} = ${i}")
        values.append(v)

    idx = len(values) + 1
    values.append(meal_id)
    set_clause = ", ".join(set_parts)

    async with get_db() as conn:
        row = await conn.fetchrow(
            f"UPDATE meals SET {set_clause}, updated_at = NOW() WHERE id = ${idx} RETURNING *",
            *values,
        )
        return _row_to_dict(row) if row else None


async def delete_meal(meal_id: int) -> bool:
    """DELETE a meal. Returns True if a row was deleted."""
    async with get_db() as conn:
        result = await conn.execute("DELETE FROM meals WHERE id = $1", meal_id)
        return result == "DELETE 1"
