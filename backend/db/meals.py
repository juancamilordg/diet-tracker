from db.connection import get_db


async def create_meal(data: dict, user_id: int = 1) -> dict:
    """INSERT a new meal and return the created row as a dict."""
    data["user_id"] = user_id
    columns = list(data.keys())
    placeholders = ", ".join(["?"] * len(columns))
    col_names = ", ".join(columns)
    values = [data[c] for c in columns]

    async with get_db() as db:
        cursor = await db.execute(
            f"INSERT INTO meals ({col_names}) VALUES ({placeholders})",
            values,
        )
        await db.commit()
        meal_id = cursor.lastrowid

        row = await db.execute("SELECT * FROM meals WHERE id = ?", (meal_id,))
        result = await row.fetchone()
        return dict(result)


async def get_meal(meal_id: int) -> dict | None:
    """SELECT a single meal by id."""
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM meals WHERE id = ?", (meal_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None


async def get_meals(
    user_id: int = 1,
    limit: int = 50,
    offset: int = 0,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[dict]:
    """SELECT meals for a user with optional date filtering, ordered by logged_at DESC."""
    query = "SELECT * FROM meals"
    conditions: list[str] = ["user_id = ?"]
    params: list = [user_id]

    if date_from:
        conditions.append("date(logged_at) >= date(?)")
        params.append(date_from)
    if date_to:
        conditions.append("date(logged_at) <= date(?)")
        params.append(date_to)

    query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY logged_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    async with get_db() as db:
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def update_meal(meal_id: int, data: dict) -> dict | None:
    """UPDATE a meal and return the updated row."""
    if not data:
        return await get_meal(meal_id)

    set_clause = ", ".join([f"{k} = ?" for k in data.keys()])
    values = list(data.values()) + [meal_id]

    async with get_db() as db:
        await db.execute(
            f"UPDATE meals SET {set_clause}, updated_at = datetime('now') WHERE id = ?",
            values,
        )
        await db.commit()

        cursor = await db.execute("SELECT * FROM meals WHERE id = ?", (meal_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None


async def delete_meal(meal_id: int) -> bool:
    """DELETE a meal. Returns True if a row was deleted."""
    async with get_db() as db:
        cursor = await db.execute("DELETE FROM meals WHERE id = ?", (meal_id,))
        await db.commit()
        return cursor.rowcount > 0
