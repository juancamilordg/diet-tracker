import logging
from contextlib import asynccontextmanager

import psycopg
from psycopg.rows import dict_row

import config

logger = logging.getLogger(__name__)


async def init_db():
    """Verify database connectivity on startup (non-fatal)."""
    try:
        async with await psycopg.AsyncConnection.connect(
            config.DATABASE_URL, autocommit=True
        ) as conn:
            await conn.execute("SELECT 1")
        logger.info("Database connection verified")
    except Exception as e:
        logger.warning(f"Database not reachable at startup (will retry per-request): {e}")


async def close_db():
    """No pool to close — connections are created per-request."""
    pass


@asynccontextmanager
async def get_db():
    """Async context manager that creates a fresh connection with autocommit."""
    conn = await psycopg.AsyncConnection.connect(
        config.DATABASE_URL, autocommit=True, row_factory=dict_row
    )
    try:
        yield conn
    finally:
        await conn.close()
