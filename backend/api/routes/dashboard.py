from fastapi import APIRouter, Depends
from typing import Optional
from api.deps import get_current_user_id
from db.summaries import get_dashboard_data

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/dashboard")
async def dashboard(user_id: int = Depends(get_current_user_id), date: Optional[str] = None):
    return await get_dashboard_data(user_id, date=date)
