def _progress_bar(current: float, target: float, length: int = 10) -> str:
    """Create a progress bar using block characters."""
    if target <= 0:
        return "░" * length
    ratio = min(current / target, 1.0)
    filled = int(ratio * length)
    empty = length - filled
    return "▓" * filled + "░" * empty


def _escape_md(text: str) -> str:
    """Escape special characters for Telegram Markdown (v1)."""
    special = r'_*[`'
    return ''.join(f'\\{c}' if c in special else c for c in str(text))


def _escape_md2(text: str) -> str:
    """Escape special characters for Telegram MarkdownV2."""
    special = r'_*[]()~`>#+-=|{}.!'
    return ''.join(f'\\{c}' if c in special else c for c in str(text))


def format_nutrition_estimate(data: dict) -> str:
    """Format the AI analysis result as plain text (no markdown parsing needed)."""
    name = data.get("meal_name") or data.get("description", "Meal")
    calories = data.get("calories", 0)
    protein = data.get("protein_g", 0)
    carbs = data.get("carbs_g", 0)
    fat = data.get("fat_g", 0)
    fiber = data.get("fiber_g", 0)
    sodium = data.get("sodium_mg", 0)

    return (
        f"🍽 {name}\n"
        f"\n"
        f"  Calories:  {calories:>6} kcal\n"
        f"  Protein:   {protein:>6} g\n"
        f"  Carbs:     {carbs:>6} g\n"
        f"  Fat:       {fat:>6} g\n"
        f"  Fiber:     {fiber:>6} g\n"
        f"  Sodium:    {sodium:>6} mg\n"
        f"\n"
        f"AI estimate — verify before saving"
    )


def format_daily_summary(summary: dict, goals: dict) -> str:
    """Format today's summary vs goals as plain text."""
    cal_eaten = summary.get("total_calories", 0)
    cal_target = goals.get("daily_calories_target", 2000)
    protein_eaten = summary.get("total_protein_g", 0)
    protein_target = goals.get("protein_target_g", 150)
    carbs_eaten = summary.get("total_carbs_g", 0)
    carbs_target = goals.get("carbs_target_g", 250)
    fat_eaten = summary.get("total_fat_g", 0)
    fat_target = goals.get("fat_target_g", 65)

    lines = [
        "📊 Today's Summary\n",
        f"Calories: {cal_eaten}/{cal_target} kcal",
        f"{_progress_bar(cal_eaten, cal_target)}\n",
        f"Protein:  {protein_eaten}/{protein_target} g",
        f"{_progress_bar(protein_eaten, protein_target)}",
        f"Carbs:    {carbs_eaten}/{carbs_target} g",
        f"{_progress_bar(carbs_eaten, carbs_target)}",
        f"Fat:      {fat_eaten}/{fat_target} g",
        f"{_progress_bar(fat_eaten, fat_target)}",
    ]

    meals_count = summary.get("meal_count", 0)
    if meals_count > 0:
        lines.append(f"\nMeals logged today: {meals_count}")

    return "\n".join(lines)


def format_meal_saved(data: dict, category: str) -> str:
    """Confirmation message after saving a meal (plain text)."""
    name = data.get("meal_name") or data.get("description", "Meal")
    calories = data.get("calories", 0)

    category_emoji = {
        "breakfast": "🌅",
        "lunch": "☀️",
        "dinner": "🌙",
        "snack": "🍎",
    }
    emoji = category_emoji.get(category, "🍽")

    return (
        f"✅ Meal saved!\n"
        f"\n"
        f"{emoji} {name} — {category.capitalize()}\n"
        f"{calories} kcal"
    )
