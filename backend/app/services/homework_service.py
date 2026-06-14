import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.homework import Homework, HomeworkFile
from app.models.student import Student
from app.schemas.homework import HomeworkCreate, HomeworkUpdate


async def _get_homework_with_access(
    db: AsyncSession, homework_id: uuid.UUID, tutor_id: uuid.UUID
) -> Homework:
    result = await db.execute(
        select(Homework)
        .options(selectinload(Homework.files))
        .where(Homework.id == homework_id, Homework.tutor_id == tutor_id)
    )
    hw = result.scalar_one_or_none()
    if not hw:
        raise ValueError("Homework not found")
    return hw


async def create_homework(
    db: AsyncSession, tutor_id: uuid.UUID, data: HomeworkCreate
) -> Homework:
    student_result = await db.execute(
        select(Student).where(Student.id == data.student_id, Student.tutor_id == tutor_id)
    )
    if not student_result.scalar_one_or_none():
        raise ValueError("Student not found or not owned by tutor")

    hw = Homework(
        tutor_id=tutor_id,
        student_id=data.student_id,
        title=data.title,
        description=data.description,
        type=data.type,
        due_date=data.due_date,
    )
    db.add(hw)
    await db.flush()
    await db.refresh(hw, attribute_names=["files"])
    return hw


async def list_homework(
    db: AsyncSession,
    tutor_id: uuid.UUID,
    student_id: uuid.UUID | None = None,
    status_filter: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Homework], int]:
    query = select(Homework).options(selectinload(Homework.files)).where(
        Homework.tutor_id == tutor_id
    )
    count_query = select(func.count(Homework.id)).where(Homework.tutor_id == tutor_id)

    if student_id:
        query = query.where(Homework.student_id == student_id)
        count_query = count_query.where(Homework.student_id == student_id)
    if status_filter:
        query = query.where(Homework.status == status_filter)
        count_query = count_query.where(Homework.status == status_filter)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.order_by(Homework.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    homeworks = list(result.scalars().unique().all())

    return homeworks, total


async def get_homework(
    db: AsyncSession, homework_id: uuid.UUID, tutor_id: uuid.UUID
) -> Homework:
    return await _get_homework_with_access(db, homework_id, tutor_id)


async def update_homework(
    db: AsyncSession,
    homework_id: uuid.UUID,
    tutor_id: uuid.UUID,
    data: HomeworkUpdate,
) -> Homework:
    hw = await _get_homework_with_access(db, homework_id, tutor_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hw, field, value)
    await db.flush()
    await db.refresh(hw, attribute_names=["files"])
    return hw


async def delete_homework(
    db: AsyncSession, homework_id: uuid.UUID, tutor_id: uuid.UUID
) -> None:
    hw = await _get_homework_with_access(db, homework_id, tutor_id)
    await db.delete(hw)
    await db.flush()


async def archive_homework(
    db: AsyncSession, homework_id: uuid.UUID, tutor_id: uuid.UUID
) -> Homework:
    hw = await _get_homework_with_access(db, homework_id, tutor_id)
    hw.status = "archived"
    await db.flush()
    await db.refresh(hw, attribute_names=["files"])
    return hw


async def add_file(db: AsyncSession, homework_id: uuid.UUID, file_data: dict) -> HomeworkFile:
    result = await db.execute(
        select(Homework).where(Homework.id == homework_id)
    )
    hw = result.scalar_one_or_none()
    if not hw:
        raise ValueError("Homework not found")

    hf = HomeworkFile(
        homework_id=homework_id,
        file_url=file_data["url"],
        file_name=file_data["name"],
        file_type=file_data["type"],
        file_size=file_data["size"],
    )
    db.add(hf)
    await db.flush()
    await db.refresh(hf)
    return hf


async def remove_file(
    db: AsyncSession, file_id: uuid.UUID, tutor_id: uuid.UUID
) -> None:
    result = await db.execute(
        select(HomeworkFile)
        .join(Homework, HomeworkFile.homework_id == Homework.id)
        .where(HomeworkFile.id == file_id, Homework.tutor_id == tutor_id)
    )
    hf = result.scalar_one_or_none()
    if not hf:
        raise ValueError("File not found")
    await db.delete(hf)
    await db.flush()


async def get_student_homework(db: AsyncSession, student_id: uuid.UUID) -> list[Homework]:
    result = await db.execute(
        select(Homework)
        .options(selectinload(Homework.files))
        .where(Homework.student_id == student_id)
        .order_by(Homework.due_date.desc())
    )
    return list(result.scalars().unique().all())
