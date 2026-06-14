from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.models.user import User
from app.schemas.student import (
    StudentCreate,
    StudentListResponse,
    StudentResponse,
    StudentStatusUpdate,
    StudentUpdate,
)
from app.security.permissions import get_current_active_user, require_role
from app.services import student_service

router = APIRouter(tags=["Students"])


@router.get("", response_model=StudentListResponse)
async def list_students(
    status_filter: str | None = Query(None, alias="status", pattern="^(active|paused|finished)$"),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == "admin":
        from sqlalchemy import func, or_, select
        from app.models.student import Student

        query = select(Student)
        count_query = select(func.count(Student.id))

        if status_filter:
            query = query.where(Student.status == status_filter)
            count_query = count_query.where(Student.status == status_filter)
        if search:
            search_filter = or_(
                Student.first_name.ilike(f"%{search}%"),
                Student.last_name.ilike(f"%{search}%"),
                Student.email.ilike(f"%{search}%"),
                Student.subject.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(Student.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await db.execute(query)
        students = list(result.scalars().all())

        return StudentListResponse(
            students=[StudentResponse.model_validate(s) for s in students],
            total=total,
            page=page,
            per_page=per_page,
        )

    students, total = await student_service.list_students(
        db, current_user.id, status_filter, search, page, per_page
    )
    return StudentListResponse(
        students=[StudentResponse.model_validate(s) for s in students],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    try:
        if current_user.role == "admin":
            student = await student_service.get_student_by_id(db, student_id)
        else:
            student = await student_service.get_student(db, student_id, current_user.id)
        return student
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    data: StudentCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        student = await student_service.create_student(db, current_user.id, data)
        return student
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: UUID,
    data: StudentUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        student = await student_service.update_student(db, student_id, current_user.id, data)
        return student
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("admin")),
):
    try:
        await student_service.delete_student(db, student_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{student_id}/status", response_model=StudentResponse)
async def update_student_status(
    student_id: UUID,
    data: StudentStatusUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        student = await student_service.update_student_status(
            db, student_id, current_user.id, data.status
        )
        return student
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{student_id}/lessons")
async def get_student_lessons(
    student_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    try:
        lessons, total = await student_service.get_student_lessons(
            db, student_id, current_user.id, page, per_page
        )
        from app.schemas.lesson import LessonResponse

        return {
            "lessons": [LessonResponse.model_validate(l) for l in lessons],
            "total": total,
            "page": page,
            "per_page": per_page,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{student_id}/payments")
async def get_student_payments(
    student_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    try:
        payments = await student_service.get_student_payments(
            db, student_id, current_user.id
        )
        return {"payments": payments}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
