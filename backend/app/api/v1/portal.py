from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db_session
from app.models.homework import Homework
from app.models.lesson import Lesson
from app.models.student import Student
from app.models.user import User
from app.schemas.homework import HomeworkFileResponse, HomeworkResponse
from app.schemas.portal import (
    PortalHistoryResponse,
    PortalLessonResponse,
    PortalPaymentItem,
    PortalPaymentsResponse,
    PortalScheduleResponse,
)
from app.security.permissions import require_role

router = APIRouter(tags=["Student Portal"])


async def _get_student_from_user(
    db: AsyncSession, user: User
) -> Student:
    result = await db.execute(
        select(Student).where(Student.email == user.email)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found for this user",
        )
    return student


def _homework_to_response(hw) -> HomeworkResponse:
    files = [HomeworkFileResponse.model_validate(f) for f in (hw.files or [])]
    student_name = None
    if hasattr(hw, "student") and hw.student:
        student_name = f"{hw.student.first_name} {hw.student.last_name}"
    return HomeworkResponse(
        id=hw.id,
        student_id=hw.student_id,
        tutor_id=hw.tutor_id,
        title=hw.title,
        description=hw.description,
        type=hw.type,
        due_date=hw.due_date,
        status=hw.status,
        grade=hw.grade,
        files=files,
        student_name=student_name,
        created_at=hw.created_at,
    )


@router.get("/schedule", response_model=PortalScheduleResponse)
async def get_schedule(
    days: int = Query(30, ge=1, le=90),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("student")),
):
    student = await _get_student_from_user(db, current_user)

    today = date.today()
    end_date = today + timedelta(days=days)

    result = await db.execute(
        select(Lesson)
        .where(
            Lesson.student_id == student.id,
            Lesson.date >= today,
            Lesson.date <= end_date,
            Lesson.status == "scheduled",
        )
        .order_by(Lesson.date, Lesson.start_time)
    )
    lessons = list(result.scalars().all())

    return PortalScheduleResponse(
        lessons=[PortalLessonResponse.model_validate(l) for l in lessons]
    )


@router.get("/homework", response_model=list[HomeworkResponse])
async def get_homework(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("student")),
):
    student = await _get_student_from_user(db, current_user)

    result = await db.execute(
        select(Homework)
        .options(selectinload(Homework.files))
        .where(Homework.student_id == student.id)
        .order_by(Homework.due_date.desc())
    )
    homeworks = list(result.scalars().unique().all())

    return [_homework_to_response(h) for h in homeworks]


@router.get("/history", response_model=PortalHistoryResponse)
async def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("student")),
):
    student = await _get_student_from_user(db, current_user)

    query = select(Lesson).where(
        Lesson.student_id == student.id,
        Lesson.status == "completed",
    )
    count_query = select(func.count(Lesson.id)).where(
        Lesson.student_id == student.id,
        Lesson.status == "completed",
    )

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.order_by(Lesson.date.desc(), Lesson.start_time.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    lessons = list(result.scalars().all())

    return PortalHistoryResponse(
        lessons=[PortalLessonResponse.model_validate(l) for l in lessons],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/payments", response_model=PortalPaymentsResponse)
async def get_payments(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("student")),
):
    student = await _get_student_from_user(db, current_user)

    result = await db.execute(
        select(Lesson)
        .where(
            Lesson.student_id == student.id,
            Lesson.status == "completed",
        )
        .order_by(Lesson.date.desc())
    )
    lessons = list(result.scalars().all())

    payments = [
        PortalPaymentItem(
            lesson_id=lesson.id,
            date=lesson.date,
            price=float(lesson.price),
            payment_status=lesson.payment_status,
        )
        for lesson in lessons
    ]

    return PortalPaymentsResponse(payments=payments)
