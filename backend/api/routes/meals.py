import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional
from api.schemas import MealCreate, MealUpdate, AnalyzeRequest
from api.deps import get_current_user_id
from db import meals as meals_db
from ai.analyzer import analyze_photo, analyze_text

PHOTO_DIR = "/app/data/photos"
os.makedirs(PHOTO_DIR, exist_ok=True)

router = APIRouter(prefix="/api/meals", tags=["meals"])

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
    """Save an uploaded photo and return its URL."""
    ext = os.path.splitext(photo.filename or "photo.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(PHOTO_DIR, filename)
    content = await photo.read()
    with open(filepath, "wb") as f:
        f.write(content)
    return {"photo_url": f"/api/meals/photos/{filename}"}


@router.get("/photos/{filename}")
async def get_photo(filename: str):
    """Serve an uploaded photo."""
    filepath = os.path.join(PHOTO_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Photo not found")
    return FileResponse(filepath)


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
