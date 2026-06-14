from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class StudentCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=20)
    subject: str = Field(..., min_length=1, max_length=100)
    lesson_price: float = Field(..., gt=0)
    notes: str | None = None


class StudentUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    email: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=20)
    subject: str | None = Field(None, min_length=1, max_length=100)
    lesson_price: float | None = Field(None, gt=0)
    notes: str | None = None
    status: Literal["active", "paused", "finished"] | None = None


class StudentStatusUpdate(BaseModel):
    status: Literal["active", "paused", "finished"]


class StudentResponse(BaseModel):
    id: UUID
    tutor_id: UUID
    first_name: str
    last_name: str
    email: str | None
    phone: str | None
    subject: str
    lesson_price: float
    notes: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StudentListResponse(BaseModel):
    students: list[StudentResponse]
    total: int
    page: int
    per_page: int
