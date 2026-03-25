import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from typing import Optional
from api.schemas import MealCreate, MealUpdate, AnalyzeRequest
from api.deps import get_current_user_id
from db import meals as meals_db
from ai.analyzer import analyze_photo, analyze_text
import config

router = APIRouter(prefix="/api/meals", tags=["meals"])


def _storage_url(path: str) -> str:
    """Build a public Supabase Storage URL."""
    return f"{config.SUPABASE_URL}/storage/v1/object/public/meal-photos/{path}"


@router.get("")
async def list_meals(limit: int = 50, offset: int = 0, date_from: str = None, date_to: str = None, user_id: int = Depends(get_current_user_id)):
    return await meals_db.get_meals(user_id=user_id, limit=limit, offset=offset, date_from=date_from, date_to=date_to)

@router.get("/{meal_id}")
async def get_meal(meal_id: int):
    meal = await meals_db.get_meal(meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal

@router.post("")
async def create_meal(meal: MealCreate, user_id: int = Depends(get_current_user_id)):
    return await meals_db.create_meal(meal.model_dump(exclude_none=True), user_id=user_id)

@router.put("/{meal_id}")
async def update_meal(meal_id: int, meal: MealUpdate):
    result = await meals_db.update_meal(meal_id, meal.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="Meal not found")
    return result

@router.delete("/{meal_id}")
async def delete_meal(meal_id: int):
    success = await meals_db.delete_meal(meal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"ok": True}

@router.post("/upload-photo")
async def upload_photo(photo: UploadFile = File(...)):
    """Upload a photo to Supabase Storage and return its public URL."""
    import os
    ext = os.path.splitext(photo.filename or "photo.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    content = await photo.read()
    content_type = photo.content_type or "image/jpeg"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{config.SUPABASE_URL}/storage/v1/object/meal-photos/{filename}",
            headers={
                "Authorization": f"Bearer {config.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": content_type,
            },
            content=content,
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=502, detail=f"Storage upload failed: {resp.text}")

    return {"photo_url": _storage_url(filename)}


@router.get("/photos/{filename}")
async def get_photo(filename: str):
    """Redirect to the Supabase Storage public URL."""
    return RedirectResponse(url=_storage_url(filename))


@router.post("/analyze")
async def analyze_meal(
    photo: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
):
    if photo:
        image_data = await photo.read()
        media_type = photo.content_type or "image/jpeg"
        result = await analyze_photo(image_data, media_type)
    elif description:
        result = await analyze_text(description)
    else:
        raise HTTPException(status_code=400, detail="Provide a photo or description")
    return result
