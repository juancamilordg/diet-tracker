from telegram import Update
from telegram.ext import ContextTypes

from db.users import get_or_create_by_telegram_id


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Welcome message explaining the bot's capabilities. Auto-registers the user."""
    # Auto-register user
    tg_user = update.effective_user
    user = await get_or_create_by_telegram_id(tg_user.id, tg_user.first_name)
    context.user_data["user_id"] = user["id"]

    welcome_text = (
        "Welcome to Diet Tracker Bot! 🥗\n"
        "\n"
        "I help you track your meals and nutrition using AI.\n"
        "\n"
        "How to use:\n"
        "📸 Send a photo of your meal and I'll estimate its nutrition\n"
        "✍️ Use /log followed by a description to log a meal by text\n"
        "📊 Use /today to see your daily summary\n"
        "\n"
        "After analyzing your meal, you can confirm, edit, or cancel "
        "before saving it to your log.\n"
        "\n"
        "Type /help for a full list of commands."
    )
    await update.message.reply_text(welcome_text)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """List of available commands."""
    help_text = (
        "Available Commands:\n"
        "\n"
        "/start — Show welcome message\n"
        "/help — Show this help message\n"
        "/today — View today's nutrition summary\n"
        "/log <text> — Log a meal by description\n"
        "\n"
        "Other ways to log meals:\n"
        "📸 Send a photo directly — AI will analyze it\n"
        "\n"
        "Example: /log 2 scrambled eggs with toast and orange juice"
    )
    await update.message.reply_text(help_text)
