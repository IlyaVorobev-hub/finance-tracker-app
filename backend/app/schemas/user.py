import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Literal["super_admin", "admin", "tutor", "student"] = "tutor"
    first_name: str
    last_name: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    role: Literal["super_admin", "admin", "tutor", "student"] | None = None
    is_active: bool | None = None


class UserRoleUpdate(BaseModel):
    role: Literal["super_admin", "admin", "tutor", "student"]


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    is_active: bool
    email_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
