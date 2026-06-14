from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.models.user import User
from app.schemas.homework import (
    HomeworkCreate,
    HomeworkFileResponse,
    HomeworkListResponse,
    HomeworkResponse,
    HomeworkUpdate,
)
from app.security.permissions import get_current_active_user, require_role
from app.services import homework_service, storage_service

router = APIRouter(tags=["Homework"])


def _homework_to_response(hw) -> HomeworkResponse:
    student_name = None
    if hasattr(hw, "student") and hw.student:
        student_name = f"{hw.student.first_name} {hw.student.last_name}"
    files = [HomeworkFileResponse.model_validate(f) for f in (hw.files or [])]
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


@router.get("", response_model=HomeworkListResponse)
async def list_homework(
    student_id: UUID | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    homeworks, total = await homework_service.list_homework(
        db, current_user.id, student_id, status_filter, page, per_page
    )
    return HomeworkListResponse(
        homework=[_homework_to_response(h) for h in homeworks],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{homework_id}", response_model=HomeworkResponse)
async def get_homework(
    homework_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    try:
        hw = await homework_service.get_homework(db, homework_id, current_user.id)
        return _homework_to_response(hw)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=HomeworkResponse, status_code=status.HTTP_201_CREATED)
async def create_homework(
    data: HomeworkCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        hw = await homework_service.create_homework(db, current_user.id, data)
        return _homework_to_response(hw)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{homework_id}", response_model=HomeworkResponse)
async def update_homework(
    homework_id: UUID,
    data: HomeworkUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        hw = await homework_service.update_homework(db, homework_id, current_user.id, data)
        return _homework_to_response(hw)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{homework_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_homework(
    homework_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        await homework_service.delete_homework(db, homework_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{homework_id}/archive", response_model=HomeworkResponse)
async def archive_homework(
    homework_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        hw = await homework_service.archive_homework(db, homework_id, current_user.id)
        return _homework_to_response(hw)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{homework_id}/files", response_model=HomeworkFileResponse)
async def upload_file(
    homework_id: UUID,
    file: UploadFile,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        file_data = await storage_service.upload_file(
            file, bucket="homework", path=str(homework_id)
        )
        hf = await homework_service.add_file(db, homework_id, file_data)
        return hf
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{homework_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_file(
    homework_id: UUID,
    file_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    try:
        await homework_service.remove_file(db, file_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/student/{student_id}", response_model=list[HomeworkResponse])
async def get_student_homework(
    student_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == "student":
        from app.models.student import Student
        from sqlalchemy import select

        result = await db.execute(
            select(Student).where(Student.id == student_id, Student.email == current_user.email)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view other students' homework",
            )
    else:
        from app.services import student_service

        try:
            await student_service.get_student(db, student_id, current_user.id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    homeworks = await homework_service.get_student_homework(db, student_id)
    return [_homework_to_response(h) for h in homeworks]
