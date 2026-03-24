import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import uvicorn

import config
from db.connection import init_db
from api.routes import dashboard, meals, goals, water, stats, photos, users
from bot.setup import create_bot, start_bot, stop_bot

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

bot_app = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global bot_app
    # Initialize database
    await init_db()
    logger.info("Database initialized")

    # Start Telegram bot if token is configured
    if config.TELEGRAM_BOT_TOKEN:
        try:
            bot_app = create_bot()
            await start_bot(bot_app)
            logger.info("Telegram bot started")
        except Exception as e:
            logger.error(f"Failed to start Telegram bot: {e}")
            bot_app = None
    else:
        logger.warning("TELEGRAM_BOT_TOKEN not set, bot disabled")

    yield

    # Cleanup
    if bot_app:
        await stop_bot(bot_app)
        logger.info("Telegram bot stopped")

app = FastAPI(title="Nutrition Tracker API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(dashboard.router)
app.include_router(meals.router)
app.include_router(goals.router)
app.include_router(water.router)
app.include_router(stats.router)
app.include_router(photos.router)
app.include_router(users.router)

@app.get("/api/health")
async def health():
    return {"status": "ok", "bot_active": bot_app is not None}

# Serve frontend static files if the dist directory exists
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA for all non-API routes."""
        if full_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404)
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.API_HOST, port=config.API_PORT, reload=False)
