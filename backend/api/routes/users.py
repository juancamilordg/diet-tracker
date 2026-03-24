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
    async with get_db() as db:
        cursor = await db.execute(
            "INSERT INTO users (display_name) VALUES (?)", (data.display_name,)
        )
        await db.commit()
        user_id = cursor.lastrowid
        await db.execute("INSERT OR IGNORE INTO goals (user_id) VALUES (?)", (user_id,))
        await db.commit()
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = await cursor.fetchone()
        return dict(row)
