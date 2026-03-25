from db.connection import get_db


def _serialize(d: dict) -> dict:
    return {k: v.isoformat() if hasattr(v, 'isoformat') else v for k, v in d.items()}


async def get_goals(user_id: int = 1) -> dict:
    """Return the goals row for a user."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM goals WHERE user_id = %s", (user_id,))
            row = await cur.fetchone()
            if row:
                return _serialize(row)
            # Auto-create goals for this user if missing
            await cur.execute(
                "INSERT INTO goals (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
                (user_id,),
            )
            await cur.execute("SELECT * FROM goals WHERE user_id = %s", (user_id,))
            row = await cur.fetchone()
            return _serialize(row) if row else {}


async def update_goals(user_id: int = 1, data: dict = None) -> dict:
    """UPDATE goals for a user and return the updated row."""
    if not data:
        return await get_goals(user_id)

    # Ensure goals row exists
    await get_goals(user_id)

    set_parts = [f"{k} = %s" for k in data.keys()]
    values = list(data.values()) + [user_id]
    set_clause = ", ".join(set_parts)

    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                f"UPDATE goals SET {set_clause}, updated_at = NOW() WHERE user_id = %s RETURNING *",
                values,
            )
            row = await cur.fetchone()
            return _serialize(row) if row else {}
