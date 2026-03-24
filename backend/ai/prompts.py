NUTRITION_SYSTEM_PROMPT = """You are a precise nutrition analyst for the Kinetic Lab diet tracker.
Your job is to estimate the nutritional content of meals from photos or text descriptions.

Guidelines:
- Be accurate but conservative with estimates
- Account for "hidden" calories: cooking oils, sauces, dressings, butter
- If unsure about portion size, estimate a standard adult serving
- Always provide your best estimate even if uncertain
- For photos, describe what you see before estimating

Return your analysis using the provided tool."""

NUTRITION_TOOL = {
    "name": "log_nutrition",
    "description": "Log the nutritional analysis of a meal",
    "input_schema": {
        "type": "object",
        "properties": {
            "meal_name": {
                "type": "string",
                "description": "A concise, descriptive name for the meal"
            },
            "description": {
                "type": "string",
                "description": "Brief description of the meal components"
            },
            "calories": {
                "type": "number",
                "description": "Estimated total calories (kcal)"
            },
            "protein_g": {
                "type": "number",
                "description": "Estimated protein in grams"
            },
            "carbs_g": {
                "type": "number",
                "description": "Estimated carbohydrates in grams"
            },
            "fat_g": {
                "type": "number",
                "description": "Estimated fat in grams"
            },
            "fiber_g": {
                "type": "number",
                "description": "Estimated fiber in grams"
            },
            "sodium_mg": {
                "type": "number",
                "description": "Estimated sodium in milligrams"
            }
        },
        "required": ["meal_name", "description", "calories", "protein_g", "carbs_g", "fat_g"]
    }
}
