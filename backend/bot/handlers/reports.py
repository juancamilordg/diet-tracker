import logging

from telegram import Update
from telegram.ext import ContextTypes

from bot.formatters import format_daily_summary
from db import summaries as db_summaries
from db import goals as db_goals
from db.users import get_or_create_by_telegram_id

logger = logging.getLogger(__name__)


async def today_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show today's nutrition summary vs goals."""
    try:
        # Ensure user is registered and get their user_id
        if "user_id" not in context.user_data:
            tg_user = update.effective_user
            user = await get_or_create_by_telegram_id(tg_user.id, tg_user.first_name)
            context.user_data["user_id"] = user["id"]

        user_id = context.user_data["user_id"]
        summary = await db_summaries.get_today_summary(user_id)
        goals = await db_goals.get_goals(user_id)

        text = format_daily_summary(summary, goals)
        await update.message.reply_text(text)

    except Exception as e:
        logger.error(f"Error fetching today's summary: {e}")
        await update.message.reply_text(
            "Sorry, I couldn't fetch your summary. Please try again."
        )
