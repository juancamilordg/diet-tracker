import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

import aiosqlite

from config import DATABASE_PATH

SCHEMA_PATH = Path(__file__).parent / "schema.sql"
logger = logging.getLogger(__name__)


@asynccontextmanager
async def get_db():
    """Async context manager that yields an aiosqlite connection."""
    db_path = DATABASE_PATH
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)

    db = await aiosqlite.connect(db_path)
    try:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("PRAGMA foreign_keys=ON")
        yield db
    finally:
        await db.close()


async def _table_exists(db, table_name: str) -> bool:
    cursor = await db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,),
    )
    return await cursor.fetchone() is not None


async def _column_exists(db, table_name: str, column_name: str) -> bool:
    cursor = await db.execute(f"PRAGMA table_info({table_name})")
    columns = await cursor.fetchall()
    return any(col["name"] == column_name for col in columns)


async def migrate_db():
    """Run migrations to add multi-user support to an existing database."""
    async with get_db() as db:
        logger.info("Checking migrations...")

        # 1. Create users table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id INTEGER UNIQUE,
                display_name TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)

        # 2. Insert default user only if no users exist yet
        cursor = await db.execute("SELECT COUNT(*) as cnt FROM users")
        row = await cursor.fetchone()
        if row["cnt"] == 0:
            await db.execute("INSERT OR IGNORE INTO users (id, display_name) VALUES (1, 'You')")

        # 3. Add user_id columns to existing tables
        # Note: SQLite ALTER TABLE doesn't support REFERENCES with DEFAULT,
        # so we add plain INTEGER columns and backfill.
        for table in ("meals", "water_log"):
            if not await _column_exists(db, table, "user_id"):
                await db.execute(f"ALTER TABLE {table} ADD COLUMN user_id INTEGER DEFAULT 1")
                await db.execute(f"UPDATE {table} SET user_id = 1 WHERE user_id IS NULL")

        # 4. Migrate goals table: add user_id if missing
        if not await _column_exists(db, "goals", "user_id"):
            await db.execute("ALTER TABLE goals ADD COLUMN user_id INTEGER DEFAULT 1")
            await db.execute("UPDATE goals SET user_id = 1 WHERE user_id IS NULL")

        # 5. Migrate daily_summary_cache: add user_id if missing
        if await _table_exists(db, "daily_summary_cache"):
            if not await _column_exists(db, "daily_summary_cache", "user_id"):
                await db.execute("ALTER TABLE daily_summary_cache ADD COLUMN user_id INTEGER DEFAULT 1")
                await db.execute("UPDATE daily_summary_cache SET user_id = 1 WHERE user_id IS NULL")

        # 6. Add TDEE body stats columns to goals
        for col in ("weight_kg REAL", "height_cm REAL", "age INTEGER", "sex TEXT", "activity_level TEXT"):
            col_name = col.split()[0]
            if not await _column_exists(db, "goals", col_name):
                await db.execute(f"ALTER TABLE goals ADD COLUMN {col}")

        # 7. Create indexes
        await db.execute("CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_water_log_user_id ON water_log(user_id)")

        # 8. Ensure every user has a goals row
        await db.execute("""
            INSERT OR IGNORE INTO goals (user_id)
            SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM goals)
        """)

        await db.commit()
        logger.info("Multi-user migration complete")


async def init_db():
    """Read schema.sql and execute it to initialise the database."""
    db_path = DATABASE_PATH
    db_exists = os.path.exists(db_path)

    if db_exists:
        # Existing database — run migration instead of schema
        await migrate_db()
    else:
        # Fresh database — run full schema
        schema_sql = SCHEMA_PATH.read_text()
        async with get_db() as db:
            await db.executescript(schema_sql)
            await db.commit()
