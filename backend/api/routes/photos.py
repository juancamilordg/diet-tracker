import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import config

router = APIRouter(prefix="/api/photos", tags=["photos"])

@router.get("/{file_id}")
async def get_photo(file_id: str):
    """Proxy a Telegram photo for web display."""
    if not config.TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=503, detail="Telegram not configured")

    try:
        async with httpx.AsyncClient() as client:
            # Get file path from Telegram
            resp = await client.get(
                f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/getFile",
                params={"file_id": file_id}
            )
            data = resp.json()
            if not data.get("ok"):
                raise HTTPException(status_code=404, detail="Photo not found")

            file_path = data["result"]["file_path"]

            # Download the file
            photo_resp = await client.get(
                f"https://api.telegram.org/file/bot{config.TELEGRAM_BOT_TOKEN}/{file_path}"
            )

            return StreamingResponse(
                iter([photo_resp.content]),
                media_type="image/jpeg",
                headers={"Cache-Control": "public, max-age=86400"}
            )
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Failed to fetch photo")
