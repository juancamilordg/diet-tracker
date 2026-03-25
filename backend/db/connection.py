import logging
from contextlib import asynccontextmanager
from urllib.parse import urlparse, quote_plus

import asyncpg

import config

logger = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None


def _build_direct_url(url: str) -> str:
    """Convert a Supabase pooler URL to a direct connection URL if needed.

    Supabase pooler URLs (port 6543) don't work well with asyncpg.
    Direct URLs use db.PROJECT_REF.supabase.co:5432 with user 'postgres'.
    """
    p = urlparse(url)
    if p.hostname and "pooler.supabase.com" in p.hostname:
        # Extract project ref from username (postgres.PROJECT_REF -> PROJECT_REF)
        username = p.username or ""
        project_ref = username.replace("postgres.", "") if "." in username else username
        password = quote_plus(p.password) if p.password else ""
        return f"postgresql://postgres:{password}@db.{project_ref}.supabase.co:5432/postgres"
    return url


async def init_db():
    """Create the asyncpg connection pool."""
    global _pool
    if _pool is not None:
        return
    direct_url = _build_direct_url(config.DATABASE_URL)
    _pool = await asyncpg.create_pool(direct_url, min_size=2, max_size=10)
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
    """Async context manager that yields an asyncpg connection from the pool."""
    async with _pool.acquire() as conn:
        yield conn
