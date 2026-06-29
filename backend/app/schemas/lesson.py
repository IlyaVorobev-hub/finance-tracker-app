from datetime import date, datetime, time
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class LessonCreate(BaseModel):
    student_id: UUID
    date: date
    start_time: time
    end_time: time
    price: float | None = Field(None, gt=0)
    comment: str | None = None


class LessonUpdate(BaseModel):
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    price: float | None = Field(None, gt=0)
    comment: str | None = None
    status: Literal["scheduled", "completed", "cancelled"] | None = None


class LessonReschedule(BaseModel):
    date: date
    start_time: time
    end_time: time


class LessonPaymentUpdate(BaseModel):
    payment_status: Literal["paid", "unpaid"]


class LessonStatusUpdate(BaseModel):
    status: Literal["scheduled", "completed", "cancelled"]


class RecurrenceCreate(BaseModel):
    recurrence_type: Literal["daily", "weekly", "biweekly", "monthly"]
    end_date: date
    total_occurrences: int = Field(..., gt=1)


class LessonResponse(BaseModel):
    id: UUID
    student_id: UUID
    tutor_id: UUID
    date: date
    start_time: time
    end_time: time
    price: float
    comment: str | None
    status: str
    payment_status: str
    student_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LessonListResponse(BaseModel):
    lessons: list[LessonResponse]
    total: int
    page: int
    per_page: int


class CalendarResponse(BaseModel):
    lessons: list[LessonResponse]
    start_date: date
    end_date: date
