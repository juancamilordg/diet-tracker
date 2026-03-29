from pydantic import BaseModel
from typing import Optional

class MealCreate(BaseModel):
    logged_at: Optional[str] = None
    meal_category: Optional[str] = None
    description: str
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    sodium_mg: Optional[float] = None
    photo_url: Optional[str] = None
    input_method: str = "manual"
    notes: Optional[str] = None

class MealUpdate(BaseModel):
    logged_at: Optional[str] = None
    meal_category: Optional[str] = None
    description: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    sodium_mg: Optional[float] = None
    photo_url: Optional[str] = None
    photo_file_id: Optional[str] = None
    notes: Optional[str] = None

class GoalsUpdate(BaseModel):
    daily_calories_target: Optional[int] = None
    protein_target_g: Optional[float] = None
    carbs_target_g: Optional[float] = None
    fat_target_g: Optional[float] = None
    fiber_target_g: Optional[float] = None
    water_target_ml: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    activity_level: Optional[str] = None

class WaterLog(BaseModel):
    amount_ml: int

class AnalyzeRequest(BaseModel):
    description: Optional[str] = None
    # photo will come as UploadFile, not in JSON body

class UserOut(BaseModel):
    id: int
    telegram_id: Optional[int] = None
    display_name: str
    timezone: Optional[str] = None


class TimezoneUpdate(BaseModel):
    timezone: str
