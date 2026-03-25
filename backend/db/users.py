from db.connection import get_db


def _row_to_dict(row) -> dict:
    d = dict(row)
    for k, v in d.items():
        if hasattr(v, 'isoformat'):
            d[k] = v.isoformat()
    return d


async def get_or_create_by_telegram_id(telegram_id: int, display_name: str) -> dict:
    """Find user by telegram_id or create a new one. Returns user dict."""
    async with get_db() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM users WHERE telegram_id = $1", telegram_id
        )
        if row:
            return _row_to_dict(row)

        # Create new user
        row = await conn.fetchrow(
            "INSERT INTO users (telegram_id, display_name) VALUES ($1, $2) RETURNING *",
            telegram_id, display_name,
        )
        user_id = row["id"]

        # Ensure they have a goals row
        await conn.execute(
            "INSERT INTO goals (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
            user_id,
        )

        return _row_to_dict(row)


async def get_all_users() -> list[dict]:
    """Return all users."""
    async with get_db() as conn:
        rows = await conn.fetch("SELECT * FROM users ORDER BY id")
        return [_row_to_dict(r) for r in rows]


async def get_user(user_id: int) -> dict | None:
    """Return a single user by id."""
    async with get_db() as conn:
        row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
        return _row_to_dict(row) if row else None
