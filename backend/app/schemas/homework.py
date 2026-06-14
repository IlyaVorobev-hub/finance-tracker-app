from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class HomeworkCreate(BaseModel):
    student_id: UUID
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    type: Literal["text", "file", "mixed"] = "text"
    due_date: date


class HomeworkUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    due_date: date | None = None
    status: Literal["pending", "submitted", "graded", "archived"] | None = None
    grade: str | None = None


class HomeworkStatusUpdate(BaseModel):
    status: Literal["pending", "submitted", "graded", "archived"]


class HomeworkFileResponse(BaseModel):
    id: UUID
    file_url: str
    file_name: str
    file_type: str
    file_size: int
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class HomeworkResponse(BaseModel):
    id: UUID
    student_id: UUID
    tutor_id: UUID
    title: str
    description: str | None
    type: str
    due_date: date
    status: str
    grade: str | None
    files: list[HomeworkFileResponse] = []
    student_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class HomeworkListResponse(BaseModel):
    homework: list[HomeworkResponse]
    total: int
    page: int
    per_page: int


class FileUploadResponse(BaseModel):
    id: UUID
    file_url: str
    file_name: str
    file_type: str
    file_size: int
