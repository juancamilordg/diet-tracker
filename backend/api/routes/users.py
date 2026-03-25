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
