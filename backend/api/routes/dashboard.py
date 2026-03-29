from fastapi import APIRouter, Depends
from typing import Optional

from api.deps import get_current_user_id, get_user_timezone, validate_date_param, UserDateInfo
from db.summaries import get_dashboard_data

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard")
async def dashboard(
    user_id: int = Depends(get_current_user_id),
    user_date: UserDateInfo = Depends(get_user_timezone),
    date: Optional[str] = None,
):
    resolved_date = validate_date_param(date, user_date.today) if date else user_date.today
    return await get_dashboard_data(user_id, date=resolved_date)
