from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.models.user import User
from app.schemas.lesson import (
    CalendarResponse,
    LessonCreate,
    LessonListResponse,
    LessonPaymentUpdate,
    LessonReschedule,
    LessonResponse,
    LessonStatusUpdate,
    LessonUpdate,
    RecurrenceCreate,
)
from app.security.permissions import get_current_active_user, require_role
from app.services import lesson_service

router = APIRouter(tags=["Lessons"])


def _lesson_to_response(lesson) -> LessonResponse:
    student_name = None
    if hasattr(lesson, "student") and lesson.student:
        student_name = f"{lesson.student.first_name} {lesson.student.last_name}"
    return LessonResponse(
        id=lesson.id,
        student_id=lesson.student_id,
        tutor_id=lesson.tutor_id,
        date=lesson.date,
        start_time=lesson.start_time,
        end_time=lesson.end_time,
        price=float(lesson.price),
        comment=lesson.comment,
        status=lesson.status,
        payment_status=lesson.payment_status,
        student_name=student_name,
        created_at=lesson.created_at,
    )


@router.get("/calendar", response_model=CalendarResponse)
async def get_calendar(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    lessons = await lesson_service.get_calendar_lessons(
        db, current_user.id, start_date, end_date
    )
    return CalendarResponse(
        lessons=[_lesson_to_response(l) for l in lessons],
        start_date=start_date,
        end_date=end_date,
    )


@router.get("", response_model=LessonListResponse)
async def list_lessons(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    student_id: UUID | None = Query(None),
    status_filter: str | None = Query(None, alias="status", pattern="^(scheduled|completed|cancelled)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    lessons, total = await lesson_service.list_lessons(
        db, current_user.id, start_date, end_date, student_id, status_filter, page, per_page
    )
    return LessonListResponse(
        lessons=[_lesson_to_response(l) for l in lessons],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    try:
        lesson = await lesson_service.get_lesson(db, lesson_id, current_user.id)
        return _lesson_to_response(lesson)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    data: LessonCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        lesson = await lesson_service.create_lesson(db, current_user.id, data)
        return _lesson_to_response(lesson)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: UUID,
    data: LessonUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        lesson = await lesson_service.update_lesson(db, lesson_id, current_user.id, data)
        return _lesson_to_response(lesson)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{lesson_id}", response_model=LessonResponse)
async def cancel_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        lesson = await lesson_service.cancel_lesson(db, lesson_id, current_user.id)
        return _lesson_to_response(lesson)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{lesson_id}/reschedule", response_model=LessonResponse)
async def reschedule_lesson(
    lesson_id: UUID,
    data: LessonReschedule,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        lesson = await lesson_service.reschedule_lesson(db, lesson_id, current_user.id, data)
        return _lesson_to_response(lesson)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.patch("/{lesson_id}/payment", response_model=LessonResponse)
async def update_payment_status(
    lesson_id: UUID,
    data: LessonPaymentUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        lesson = await lesson_service.update_payment_status(
            db, lesson_id, current_user.id, data.payment_status
        )
        return _lesson_to_response(lesson)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{lesson_id}/recurring")
async def create_recurring(
    lesson_id: UUID,
    data: RecurrenceCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        lessons = await lesson_service.create_recurring(db, lesson_id, current_user.id, data)
        return {
            "lessons": [_lesson_to_response(l) for l in lessons],
            "total_created": len(lessons),
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
