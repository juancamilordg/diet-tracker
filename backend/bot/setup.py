import logging

from telegram import Update
from telegram.ext import ApplicationBuilder, CallbackQueryHandler, CommandHandler, ContextTypes

import config
from bot.handlers.meal_photo import photo_conv_handler
from bot.handlers.reports import today_command
from bot.handlers.start import start_command, help_command

logger = logging.getLogger(__name__)


async def _unhandled_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Catch any callback queries not handled by conversation handlers."""
    query = update.callback_query
    logger.warning(f"Unhandled callback query: data={query.data}, from={query.from_user.id}")
    await query.answer("Session expired. Please send a new photo or /log command.")


async def _error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
    """Log errors from the bot."""
    logger.error(f"Bot error: {context.error}", exc_info=context.error)


def create_bot(app=None):
    """Create and configure the Telegram bot application.

    Args:
        app: Optional FastAPI app instance (for shared state if needed).

    Returns:
        Configured telegram.ext.Application instance.
    """
    application = (
        ApplicationBuilder()
        .token(config.TELEGRAM_BOT_TOKEN)
        .build()
    )

    # Register command handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("today", today_command))

    # Register conversation handler (photo + /log text flow)
    application.add_handler(photo_conv_handler)

    # Catch-all for unhandled callback queries
    application.add_handler(CallbackQueryHandler(_unhandled_callback))

    # Error handler
    application.add_error_handler(_error_handler)

    logger.info("Telegram bot handlers registered.")
    return application


async def start_bot(application):
    """Initialize and start the bot with polling."""
    await application.initialize()
    await application.start()
    await application.updater.start_polling()
    logger.info("Telegram bot started polling.")


async def stop_bot(application):
    """Stop the bot and clean up resources."""
    await application.updater.stop()
    await application.stop()
    await application.shutdown()
    logger.info("Telegram bot stopped.")
