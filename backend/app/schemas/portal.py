from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel


class PortalLessonResponse(BaseModel):
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
    created_at: datetime

    model_config = {"from_attributes": True}


class PortalScheduleResponse(BaseModel):
    lessons: list[PortalLessonResponse]


class PortalHistoryResponse(BaseModel):
    lessons: list[PortalLessonResponse]
    total: int
    page: int
    per_page: int


class PortalPaymentItem(BaseModel):
    lesson_id: UUID
    date: date
    price: float
    payment_status: str


class PortalPaymentsResponse(BaseModel):
    payments: list[PortalPaymentItem]
