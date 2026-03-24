import logging

from telegram import Update
from telegram.ext import (
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from ai.analyzer import analyze_photo, analyze_text
from bot.formatters import format_nutrition_estimate, format_meal_saved
from bot.keyboards import confirm_keyboard, meal_category_keyboard
from db import meals as db_meals
from db.users import get_or_create_by_telegram_id

logger = logging.getLogger(__name__)

# Conversation states
CONFIRM = 0
CATEGORY = 1


async def _ensure_user(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Ensure user is registered and return their user_id."""
    if "user_id" not in context.user_data:
        tg_user = update.effective_user
        user = await get_or_create_by_telegram_id(tg_user.id, tg_user.first_name)
        context.user_data["user_id"] = user["id"]
    return context.user_data["user_id"]


async def photo_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Entry point for photo meal logging. Downloads photo and runs AI analysis."""
    user_id = await _ensure_user(update, context)
    await update.message.reply_text("📸 Analyzing your meal...")

    try:
        # Get the largest photo size
        photo = update.message.photo[-1]
        file = await context.bot.get_file(photo.file_id)
        photo_bytes = await file.download_as_bytearray()

        # Run AI analysis (include caption as context if provided)
        caption = update.message.caption or ""
        analysis = await analyze_photo(bytes(photo_bytes), caption=caption)

        # Store pending meal data
        context.user_data["pending_meal"] = {
            "analysis": analysis,
            "photo_file_id": photo.file_id,
            "user_id": user_id,
        }

        # Send formatted estimate with confirm keyboard
        text = format_nutrition_estimate(analysis)
        await update.message.reply_text(text, reply_markup=confirm_keyboard())
        return CONFIRM

    except Exception as e:
        logger.error(f"Error analyzing photo: {e}")
        await update.message.reply_text(
            "Sorry, I couldn't analyze that photo. Please try again."
        )
        return ConversationHandler.END


async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Entry point for text meal logging via /log command."""
    user_id = await _ensure_user(update, context)

    if not context.args:
        await update.message.reply_text(
            "Please provide a meal description.\n"
            "Example: /log 2 scrambled eggs with toast",
        )
        return ConversationHandler.END

    description = " ".join(context.args)
    await update.message.reply_text("✍️ Analyzing your meal...")

    try:
        # Run AI analysis on text
        analysis = await analyze_text(description)

        # Store pending meal data
        context.user_data["pending_meal"] = {
            "analysis": analysis,
            "photo_file_id": None,
            "user_id": user_id,
        }

        # Send formatted estimate with confirm keyboard
        text = format_nutrition_estimate(analysis)
        await update.message.reply_text(text, reply_markup=confirm_keyboard())
        return CONFIRM

    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        await update.message.reply_text(
            "Sorry, I couldn't analyze that description. Please try again."
        )
        return ConversationHandler.END


async def confirm_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle confirm/edit/cancel button presses."""
    query = update.callback_query
    logger.info(f"confirm_callback triggered with data: {query.data}")

    try:
        await query.answer()
        action = query.data

        if action == "confirm_cancel":
            context.user_data.pop("pending_meal", None)
            await query.edit_message_text("❌ Cancelled. Meal was not saved.")
            return ConversationHandler.END

        if action == "confirm_edit":
            await query.edit_message_text(
                "✏️ Editing is available in the web app. "
                "For now, select a category to save as-is, "
                "or use /cancel to discard.",
                reply_markup=meal_category_keyboard(),
            )
            return CATEGORY

        if action == "confirm_save":
            await query.edit_message_text(
                "Select a meal category:",
                reply_markup=meal_category_keyboard(),
            )
            return CATEGORY

    except Exception as e:
        logger.error(f"Error in confirm_callback: {e}")
        try:
            await query.edit_message_text("Something went wrong. Please send a new photo or /log command.")
        except Exception:
            pass
        return ConversationHandler.END

    return CONFIRM


async def category_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle meal category selection and save to database."""
    query = update.callback_query
    logger.info(f"category_callback triggered with data: {query.data}")

    try:
        await query.answer()
    except Exception:
        pass

    # Extract category from callback data (e.g., "cat_breakfast" -> "breakfast")
    category = query.data.replace("cat_", "")

    pending = context.user_data.pop("pending_meal", None)
    if not pending:
        try:
            await query.edit_message_text("No pending meal found. Please try again.")
        except Exception:
            pass
        return ConversationHandler.END

    analysis = pending["analysis"]
    photo_file_id = pending.get("photo_file_id")
    user_id = pending.get("user_id", 1)

    try:
        # Save meal to database
        meal_data = {
            "description": analysis.get("meal_name") or analysis.get("description", "Unknown meal"),
            "meal_category": category,
            "calories": analysis.get("calories", 0),
            "protein_g": analysis.get("protein_g", 0),
            "carbs_g": analysis.get("carbs_g", 0),
            "fat_g": analysis.get("fat_g", 0),
            "fiber_g": analysis.get("fiber_g", 0),
            "sodium_mg": analysis.get("sodium_mg", 0),
            "photo_file_id": photo_file_id,
            "input_method": "photo" if photo_file_id else "text",
            "ai_raw_response": analysis.get("ai_raw_response"),
        }
        await db_meals.create_meal(meal_data, user_id=user_id)

        # Send confirmation (plain text — no parse_mode to avoid escaping issues)
        confirmation = format_meal_saved(analysis, category)
        await query.edit_message_text(confirmation)

    except Exception as e:
        logger.error(f"Error saving meal: {e}")
        try:
            await query.edit_message_text("Error saving meal. Please try again.")
        except Exception:
            pass

    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Cancel the conversation."""
    context.user_data.pop("pending_meal", None)
    await update.message.reply_text("❌ Cancelled.")
    return ConversationHandler.END


# Build the conversation handler
photo_conv_handler = ConversationHandler(
    entry_points=[
        MessageHandler(filters.PHOTO, photo_handler),
        CommandHandler("log", text_handler),
    ],
    states={
        CONFIRM: [CallbackQueryHandler(confirm_callback, pattern="^confirm_")],
        CATEGORY: [CallbackQueryHandler(category_callback, pattern="^cat_")],
    },
    fallbacks=[CommandHandler("cancel", cancel)],
    per_message=False,
    per_chat=True,
)
