from db.connection import get_db


def _row_to_dict(row) -> dict:
    d = dict(row)
    for k, v in d.items():
        if hasattr(v, 'isoformat'):
            d[k] = v.isoformat()
    return d


async def get_goals(user_id: int = 1) -> dict:
    """Return the goals row for a user."""
    async with get_db() as conn:
        row = await conn.fetchrow("SELECT * FROM goals WHERE user_id = $1", user_id)
        if row:
            return _row_to_dict(row)
        # Auto-create goals for this user if missing
        await conn.execute(
            "INSERT INTO goals (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
            user_id,
        )
        row = await conn.fetchrow("SELECT * FROM goals WHERE user_id = $1", user_id)
        return _row_to_dict(row) if row else {}


async def update_goals(user_id: int = 1, data: dict = None) -> dict:
    """UPDATE goals for a user and return the updated row."""
    if not data:
        return await get_goals(user_id)

    # Ensure goals row exists
    await get_goals(user_id)

    set_parts = []
    values = []
    for i, (k, v) in enumerate(data.items(), 1):
        set_parts.append(f"{k} = ${i}")
        values.append(v)

    idx = len(values) + 1
    values.append(user_id)
    set_clause = ", ".join(set_parts)

    async with get_db() as conn:
        row = await conn.fetchrow(
            f"UPDATE goals SET {set_clause}, updated_at = NOW() WHERE user_id = ${idx} RETURNING *",
            *values,
        )
        return _row_to_dict(row) if row else {}
