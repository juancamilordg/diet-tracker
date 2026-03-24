from db.connection import get_db


async def get_goals(user_id: int = 1) -> dict:
    """Return the goals row for a user."""
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM goals WHERE user_id = ?", (user_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        # Auto-create goals for this user if missing
        await db.execute("INSERT OR IGNORE INTO goals (user_id) VALUES (?)", (user_id,))
        await db.commit()
        cursor = await db.execute("SELECT * FROM goals WHERE user_id = ?", (user_id,))
        row = await cursor.fetchone()
        return dict(row) if row else {}


async def update_goals(user_id: int = 1, data: dict = None) -> dict:
    """UPDATE goals for a user and return the updated row."""
    if not data:
        return await get_goals(user_id)

    # Ensure goals row exists
    await get_goals(user_id)

    set_clause = ", ".join([f"{k} = ?" for k in data.keys()])
    values = list(data.values()) + [user_id]

    async with get_db() as db:
        await db.execute(
            f"UPDATE goals SET {set_clause}, updated_at = datetime('now') WHERE user_id = ?",
            values,
        )
        await db.commit()

        cursor = await db.execute("SELECT * FROM goals WHERE user_id = ?", (user_id,))
        row = await cursor.fetchone()
        return dict(row) if row else {}
