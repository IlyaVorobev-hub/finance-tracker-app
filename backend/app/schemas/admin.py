import uuid
from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    action: str
    entity_type: str
    entity_id: uuid.UUID | None
    details: dict | None
    ip_address: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    logs: list[AuditLogResponse]
    total: int
    page: int
    per_page: int


class SystemStats(BaseModel):
    total_users: int
    total_tutors: int
    total_students: int
    total_lessons: int
    total_homework: int
    total_income: float
    total_expenses: float
    active_lessons_today: int
    pending_homework: int


class UserStats(BaseModel):
    user_id: uuid.UUID
    lessons_count: int
    students_count: int
    income: float
