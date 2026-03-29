from zoneinfo import available_timezones

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from api.deps import get_current_user_id
from api.schemas import TimezoneUpdate
from db import users as users_db

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreate(BaseModel):
    display_name: str
    telegram_id: Optional[int] = None


@router.get("/me")
async def get_me(user_id: int = Depends(get_current_user_id)):
    user = await users_db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/timezone")
async def update_timezone(data: TimezoneUpdate, user_id: int = Depends(get_current_user_id)):
    if data.timezone not in available_timezones():
        raise HTTPException(status_code=422, detail=f"Unknown timezone: {data.timezone!r}")
    updated = await users_db.update_user_timezone(user_id, data.timezone)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.get("")
async def list_users():
    return await users_db.get_all_users()


@router.post("")
async def create_user(data: UserCreate):
    if data.telegram_id:
        return await users_db.get_or_create_by_telegram_id(data.telegram_id, data.display_name)
    # Manual creation without telegram_id
    from db.connection import get_db
    async with get_db() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO users (display_name) VALUES (%s) RETURNING *",
                (data.display_name,),
            )
            row = await cur.fetchone()
            user_id = row["id"]
            await cur.execute(
                "INSERT INTO goals (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
                (user_id,),
            )
            return {k: v.isoformat() if hasattr(v, 'isoformat') else v for k, v in row.items()}
