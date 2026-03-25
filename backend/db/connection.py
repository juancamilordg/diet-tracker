import logging
from contextlib import asynccontextmanager

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

import config

logger = logging.getLogger(__name__)

_pool: AsyncConnectionPool | None = None


async def init_db():
    """Create the psycopg async connection pool."""
    global _pool
    if _pool is not None:
        return
    _pool = AsyncConnectionPool(
        conninfo=config.DATABASE_URL,
        min_size=2,
        max_size=10,
        open=False,
    )
    await _pool.open()
    logger.info("Database pool created")


async def close_db():
    """Close the connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("Database pool closed")


@asynccontextmanager
async def get_db():
    """Async context manager that yields a psycopg async connection with dict rows."""
    async with _pool.connection() as conn:
        conn.row_factory = dict_row
        yield conn
