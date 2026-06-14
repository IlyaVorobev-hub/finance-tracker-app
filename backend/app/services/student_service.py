import uuid
from datetime import date

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lesson import Lesson
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate


async def create_student(
    db: AsyncSession, tutor_id: uuid.UUID, data: StudentCreate
) -> Student:
    student = Student(
        tutor_id=tutor_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        subject=data.subject,
        lesson_price=data.lesson_price,
        notes=data.notes,
    )
    db.add(student)
    await db.flush()
    await db.refresh(student)
    return student


async def list_students(
    db: AsyncSession,
    tutor_id: uuid.UUID,
    status: str | None = None,
    search: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Student], int]:
    query = select(Student).where(Student.tutor_id == tutor_id)
    count_query = select(func.count(Student.id)).where(Student.tutor_id == tutor_id)

    if status:
        query = query.where(Student.status == status)
        count_query = count_query.where(Student.status == status)

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

    return students, total


async def get_student(
    db: AsyncSession, student_id: uuid.UUID, tutor_id: uuid.UUID
) -> Student:
    result = await db.execute(
        select(Student).where(Student.id == student_id, Student.tutor_id == tutor_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise ValueError("Student not found")
    return student


async def get_student_by_id(db: AsyncSession, student_id: uuid.UUID) -> Student:
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise ValueError("Student not found")
    return student


async def update_student(
    db: AsyncSession,
    student_id: uuid.UUID,
    tutor_id: uuid.UUID,
    data: StudentUpdate,
) -> Student:
    student = await get_student(db, student_id, tutor_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    await db.flush()
    await db.refresh(student)
    return student


async def delete_student(
    db: AsyncSession, student_id: uuid.UUID, tutor_id: uuid.UUID
) -> None:
    student = await get_student(db, student_id, tutor_id)
    await db.delete(student)
    await db.flush()


async def update_student_status(
    db: AsyncSession,
    student_id: uuid.UUID,
    tutor_id: uuid.UUID,
    status: str,
) -> Student:
    student = await get_student(db, student_id, tutor_id)
    student.status = status
    await db.flush()
    await db.refresh(student)
    return student


async def get_student_lessons(
    db: AsyncSession,
    student_id: uuid.UUID,
    tutor_id: uuid.UUID,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Lesson], int]:
    student = await get_student(db, student_id, tutor_id)

    query = select(Lesson).where(
        Lesson.student_id == student_id, Lesson.tutor_id == tutor_id
    )
    count_query = select(func.count(Lesson.id)).where(
        Lesson.student_id == student_id, Lesson.tutor_id == tutor_id
    )

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.order_by(Lesson.date.desc(), Lesson.start_time.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    lessons = list(result.scalars().all())

    return lessons, total


async def get_student_payments(
    db: AsyncSession, student_id: uuid.UUID, tutor_id: uuid.UUID
) -> list[dict]:
    student = await get_student(db, student_id, tutor_id)

    result = await db.execute(
        select(Lesson).where(
            Lesson.student_id == student_id,
            Lesson.tutor_id == tutor_id,
            Lesson.status == "completed",
        )
    )
    lessons = list(result.scalars().all())

    payments = []
    for lesson in lessons:
        payments.append(
            {
                "lesson_id": str(lesson.id),
                "date": lesson.date,
                "price": float(lesson.price),
                "payment_status": lesson.payment_status,
            }
        )

    return payments
