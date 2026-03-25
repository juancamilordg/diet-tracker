from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from db import users as users_db

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreate(BaseModel):
    display_name: str
    telegram_id: Optional[int] = None


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
        row = await conn.fetchrow(
            "INSERT INTO users (display_name) VALUES ($1) RETURNING *",
            data.display_name,
        )
        user_id = row["id"]
        await conn.execute(
            "INSERT INTO goals (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
            user_id,
        )
        d = dict(row)
        for k, v in d.items():
            if hasattr(v, 'isoformat'):
                d[k] = v.isoformat()
        return d
