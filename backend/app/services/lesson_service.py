import uuid
from datetime import date, timedelta

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.lesson import Lesson, LessonRecurrence
from app.models.student import Student
from app.schemas.lesson import RecurrenceCreate


async def _check_time_conflict(
    db: AsyncSession,
    tutor_id: uuid.UUID,
    student_id: uuid.UUID,
    date_val: date,
    start_time,
    end_time,
    exclude_lesson_id: uuid.UUID | None = None,
) -> Lesson | None:
    query = select(Lesson).where(
        Lesson.tutor_id == tutor_id,
        Lesson.date == date_val,
        Lesson.status != "cancelled",
        or_(
            and_(Lesson.start_time <= start_time, Lesson.end_time > start_time),
            and_(Lesson.start_time < end_time, Lesson.end_time >= end_time),
            and_(Lesson.start_time >= start_time, Lesson.end_time <= end_time),
        ),
    )
    if exclude_lesson_id:
        query = query.where(Lesson.id != exclude_lesson_id)

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def create_lesson(
    db: AsyncSession, tutor_id: uuid.UUID, data
) -> Lesson:
    student = await db.execute(
        select(Student).where(
            Student.id == data.student_id, Student.tutor_id == tutor_id
        )
    )
    student_obj = student.scalar_one_or_none()
    if not student_obj:
        raise ValueError("Student not found")

    conflict = await _check_time_conflict(
        db, tutor_id, data.student_id, data.date, data.start_time, data.end_time
    )
    if conflict:
        raise ValueError("Time conflict with existing lesson")

    price = data.price if data.price is not None else float(student_obj.lesson_price)

    lesson = Lesson(
        student_id=data.student_id,
        tutor_id=tutor_id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        price=price,
        comment=data.comment,
    )
    db.add(lesson)
    await db.flush()
    await db.refresh(lesson)
    return lesson


async def list_lessons(
    db: AsyncSession,
    tutor_id: uuid.UUID,
    start_date: date | None = None,
    end_date: date | None = None,
    student_id: uuid.UUID | None = None,
    status: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Lesson], int]:
    query = select(Lesson).where(Lesson.tutor_id == tutor_id)
    count_query = select(func.count(Lesson.id)).where(Lesson.tutor_id == tutor_id)

    if start_date:
        query = query.where(Lesson.date >= start_date)
        count_query = count_query.where(Lesson.date >= start_date)
    if end_date:
        query = query.where(Lesson.date <= end_date)
        count_query = count_query.where(Lesson.date <= end_date)
    if student_id:
        query = query.where(Lesson.student_id == student_id)
        count_query = count_query.where(Lesson.student_id == student_id)
    if status:
        query = query.where(Lesson.status == status)
        count_query = count_query.where(Lesson.status == status)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.options(selectinload(Lesson.student))
    query = query.order_by(Lesson.date.desc(), Lesson.start_time.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    lessons = list(result.scalars().all())

    return lessons, total


async def get_lesson(
    db: AsyncSession, lesson_id: uuid.UUID, tutor_id: uuid.UUID
) -> Lesson:
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.student))
        .where(Lesson.id == lesson_id, Lesson.tutor_id == tutor_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise ValueError("Lesson not found")
    return lesson


async def update_lesson(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    tutor_id: uuid.UUID,
    data,
) -> Lesson:
    lesson = await get_lesson(db, lesson_id, tutor_id)

    update_data = data.model_dump(exclude_unset=True)

    new_date = update_data.get("date", lesson.date)
    new_start = update_data.get("start_time", lesson.start_time)
    new_end = update_data.get("end_time", lesson.end_time)

    if any(k in update_data for k in ("date", "start_time", "end_time")):
        conflict = await _check_time_conflict(
            db, tutor_id, lesson.student_id, new_date, new_start, new_end, exclude_lesson_id=lesson_id
        )
        if conflict:
            raise ValueError("Time conflict with existing lesson")

    for field, value in update_data.items():
        setattr(lesson, field, value)

    await db.flush()
    await db.refresh(lesson)
    return lesson


async def cancel_lesson(
    db: AsyncSession, lesson_id: uuid.UUID, tutor_id: uuid.UUID
) -> Lesson:
    lesson = await get_lesson(db, lesson_id, tutor_id)
    lesson.status = "cancelled"
    await db.flush()
    await db.refresh(lesson)
    return lesson


async def reschedule_lesson(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    tutor_id: uuid.UUID,
    data,
) -> Lesson:
    lesson = await get_lesson(db, lesson_id, tutor_id)

    conflict = await _check_time_conflict(
        db, tutor_id, lesson.student_id, data.date, data.start_time, data.end_time, exclude_lesson_id=lesson_id
    )
    if conflict:
        raise ValueError("Time conflict with existing lesson")

    lesson.date = data.date
    lesson.start_time = data.start_time
    lesson.end_time = data.end_time
    await db.flush()
    await db.refresh(lesson)
    return lesson


async def update_payment_status(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    tutor_id: uuid.UUID,
    payment_status: str,
) -> Lesson:
    lesson = await get_lesson(db, lesson_id, tutor_id)
    lesson.payment_status = payment_status
    await db.flush()
    await db.refresh(lesson)
    return lesson


async def create_recurring(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    tutor_id: uuid.UUID,
    recurrence_data: RecurrenceCreate,
) -> list[Lesson]:
    lesson = await get_lesson(db, lesson_id, tutor_id)

    existing_recurrence = await db.execute(
        select(LessonRecurrence).where(LessonRecurrence.lesson_id == lesson_id)
    )
    if existing_recurrence.scalar_one_or_none():
        raise ValueError("Recurrence already exists for this lesson")

    recurrence = LessonRecurrence(
        lesson_id=lesson_id,
        recurrence_type=recurrence_data.recurrence_type,
        end_date=recurrence_data.end_date,
        total_occurrences=recurrence_data.total_occurrences,
        current_occurrence=1,
    )
    db.add(recurrence)

    created_lessons = [lesson]
    current_date = lesson.date

    for i in range(1, recurrence_data.total_occurrences):
        if recurrence_data.recurrence_type == "daily":
            current_date += timedelta(days=1)
        elif recurrence_data.recurrence_type == "weekly":
            current_date += timedelta(weeks=1)
        elif recurrence_data.recurrence_type == "biweekly":
            current_date += timedelta(weeks=2)
        elif recurrence_data.recurrence_type == "monthly":
            month = current_date.month + 1
            year = current_date.year
            if month > 12:
                month = 1
                year += 1
            day = min(current_date.day, 28)
            current_date = current_date.replace(year=year, month=month, day=day)

        if current_date > recurrence_data.end_date:
            break

        new_lesson = Lesson(
            student_id=lesson.student_id,
            tutor_id=tutor_id,
            date=current_date,
            start_time=lesson.start_time,
            end_time=lesson.end_time,
            price=lesson.price,
            comment=lesson.comment,
        )
        db.add(new_lesson)
        created_lessons.append(new_lesson)

    await db.flush()
    for l in created_lessons:
        await db.refresh(l)

    return created_lessons


async def get_calendar_lessons(
    db: AsyncSession,
    tutor_id: uuid.UUID,
    start_date: date,
    end_date: date,
) -> list[Lesson]:
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.student))
        .where(
            Lesson.tutor_id == tutor_id,
            Lesson.date >= start_date,
            Lesson.date <= end_date,
            Lesson.status != "cancelled",
        )
        .order_by(Lesson.date, Lesson.start_time)
    )
    return list(result.scalars().all())
