from db.connection import get_db


async def get_or_create_by_telegram_id(telegram_id: int, display_name: str) -> dict:
    """Find user by telegram_id or create a new one. Returns user dict."""
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,)
        )
        row = await cursor.fetchone()
        if row:
            return dict(row)

        # Create new user
        cursor = await db.execute(
            "INSERT INTO users (telegram_id, display_name) VALUES (?, ?)",
            (telegram_id, display_name),
        )
        await db.commit()
        user_id = cursor.lastrowid

        # Ensure they have a goals row
        await db.execute("INSERT OR IGNORE INTO goals (user_id) VALUES (?)", (user_id,))
        await db.commit()

        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = await cursor.fetchone()
        return dict(row)


async def get_all_users() -> list[dict]:
    """Return all users."""
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM users ORDER BY id")
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_user(user_id: int) -> dict | None:
    """Return a single user by id."""
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None
