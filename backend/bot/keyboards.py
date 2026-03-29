from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from telegram import InlineKeyboardButton, InlineKeyboardMarkup


def meal_category_keyboard():
    """Keyboard for selecting meal category after AI analysis."""
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🌅 Breakfast", callback_data="cat_breakfast"),
            InlineKeyboardButton("☀️ Lunch", callback_data="cat_lunch"),
        ],
        [
            InlineKeyboardButton("🌙 Dinner", callback_data="cat_dinner"),
            InlineKeyboardButton("🍎 Snack", callback_data="cat_snack"),
        ]
    ])


def confirm_keyboard():
    """Keyboard for confirming or editing AI analysis."""
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ Save", callback_data="confirm_save"),
            InlineKeyboardButton("✏️ Edit", callback_data="confirm_edit"),
            InlineKeyboardButton("❌ Cancel", callback_data="confirm_cancel"),
        ]
    ])


def date_keyboard(timezone: str) -> InlineKeyboardMarkup:
    """Keyboard for selecting meal date (today or last 6 days)."""
    tz = ZoneInfo(timezone)
    today = datetime.now(tz).date()

    buttons = [InlineKeyboardButton("Today", callback_data="date_today")]
    past_buttons = []
    for i in range(1, 7):
        day = today - timedelta(days=i)
        label = day.strftime("%b %-d")
        past_buttons.append(InlineKeyboardButton(label, callback_data=f"date_{day.isoformat()}"))

    rows = [buttons]
    # Past 6 days in rows of 3
    for i in range(0, len(past_buttons), 3):
        rows.append(past_buttons[i:i + 3])

    rows.append([InlineKeyboardButton("🌐 Older dates: use web app", callback_data="date_web")])
    return InlineKeyboardMarkup(rows)
