import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.API_HOST, port=config.API_PORT, reload=False)
