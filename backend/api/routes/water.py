from fastapi import APIRouter, Depends
from api.schemas import WaterLog
from api.deps import get_current_user_id
from db import water as water_db

router = APIRouter(prefix="/api/water", tags=["water"])

@router.get("/today")
async def water_today(user_id: int = Depends(get_current_user_id)):
    return await water_db.get_water_today(user_id)

@router.post("")
async def log_water(data: WaterLog, user_id: int = Depends(get_current_user_id)):
    return await water_db.log_water(user_id, data.amount_ml)
