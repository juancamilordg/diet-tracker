import base64
import json

import anthropic

import config
from ai.prompts import NUTRITION_SYSTEM_PROMPT, NUTRITION_TOOL

MODEL = "claude-sonnet-4-20250514"

client = anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)


async def analyze_photo(image_data: bytes, media_type: str = "image/jpeg", caption: str = "") -> dict:
    """Analyze a meal photo using Claude's vision capabilities.

    Args:
        image_data: Raw image bytes.
        media_type: MIME type of the image (e.g. "image/jpeg", "image/png").
        caption: Optional user-provided description to give context.

    Returns:
        A dict with nutritional estimates and the raw AI response.
    """
    image_b64 = base64.b64encode(image_data).decode("utf-8")

    prompt = "Analyze this meal photo and log its nutritional content."
    if caption:
        prompt = f"The user describes this meal as: \"{caption}\"\n\nAnalyze this meal photo using both the image and the user's description to log its nutritional content."

    response = await client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=NUTRITION_SYSTEM_PROMPT,
        tools=[NUTRITION_TOOL],
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt,
                    },
                ],
            }
        ],
    )

    return _extract_nutrition(response)


async def analyze_text(description: str) -> dict:
    """Analyze a text description of a meal using Claude.

    Args:
        description: A free-text description of the meal.

    Returns:
        A dict with nutritional estimates and the raw AI response.
    """
    response = await client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=NUTRITION_SYSTEM_PROMPT,
        tools=[NUTRITION_TOOL],
        messages=[
            {
                "role": "user",
                "content": f"Analyze this meal and log its nutritional content: {description}",
            }
        ],
    )

    return _extract_nutrition(response)


def _extract_nutrition(response) -> dict:
    """Extract the tool_use result from a Claude response.

    Raises:
        ValueError: If the response contains no tool_use block.
    """
    raw_content = [block.model_dump() for block in response.content]

    for block in response.content:
        if block.type == "tool_use":
            result = dict(block.input)
            result["ai_raw_response"] = json.dumps(raw_content)
            return result

    raise ValueError(
        "Claude response did not include a tool_use block. "
        f"Response content: {json.dumps(raw_content)}"
    )
