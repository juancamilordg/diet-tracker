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
