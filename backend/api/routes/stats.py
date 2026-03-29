from fastapi import APIRouter, Depends

from api.deps import get_current_user_id, get_user_timezone, UserDateInfo
from db.summaries import get_weekly_data

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/weekly")
async def weekly_stats(
    user_id: int = Depends(get_current_user_id),
    user_date: UserDateInfo = Depends(get_user_timezone),
):
    return await get_weekly_data(user_id, date=user_date.today)
