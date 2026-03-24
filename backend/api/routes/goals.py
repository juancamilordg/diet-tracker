from fastapi import APIRouter, Depends
from api.schemas import GoalsUpdate
from api.deps import get_current_user_id
from db import goals as goals_db

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("")
async def get_goals(user_id: int = Depends(get_current_user_id)):
    return await goals_db.get_goals(user_id)

@router.put("")
async def update_goals(data: GoalsUpdate, user_id: int = Depends(get_current_user_id)):
    return await goals_db.update_goals(user_id, data.model_dump(exclude_none=True))
