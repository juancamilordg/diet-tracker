from db.connection import get_db


def _serialize(d: dict) -> dict:
    return {k: v.isoformat() if hasattr(v, 'isoformat') else v for k, v in d.items()}


async def get_or_create_by_telegram_id(telegram_id: int, display_name: str) -> dict:
    """Find user by telegram_id or create a new one. Returns user dict."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT * FROM users WHERE telegram_id = %s", (telegram_id,)
            )
            row = await cur.fetchone()
            if row:
                return _serialize(row)

            # Create new user
            await cur.execute(
                "INSERT INTO users (telegram_id, display_name) VALUES (%s, %s) RETURNING *",
                (telegram_id, display_name),
            )
            row = await cur.fetchone()
            user_id = row["id"]

            # Ensure they have a goals row
            await cur.execute(
                "INSERT INTO goals (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
                (user_id,),
            )

            return _serialize(row)


async def get_all_users() -> list[dict]:
    """Return all users."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM users ORDER BY id")
            rows = await cur.fetchall()
            return [_serialize(r) for r in rows]


async def get_user(user_id: int) -> dict | None:
    """Return a single user by id."""
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            row = await cur.fetchone()
            return _serialize(row) if row else None
