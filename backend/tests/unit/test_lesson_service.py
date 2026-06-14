import uuid
from datetime import date, time, timedelta

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lesson import Lesson
from app.models.student import Student
from app.models.user import User
from app.schemas.lesson import LessonCreate, LessonReschedule, RecurrenceCreate
from app.services import lesson_service


@pytest.mark.asyncio
class TestLessonService:
    async def test_create_lesson(self, db_session: AsyncSession, test_user: User, test_student: Student):
        data = LessonCreate(
            student_id=test_student.id,
            date=date.today() + timedelta(days=1),
            start_time=time(14, 0),
            end_time=time(15, 0),
            price=50.0,
            comment="First lesson",
        )
        lesson = await lesson_service.create_lesson(db_session, test_user.id, data)
        assert lesson.student_id == test_student.id
        assert lesson.tutor_id == test_user.id
        assert lesson.price == 50.0
        assert lesson.status == "scheduled"

    async def test_create_lesson_uses_student_price(self, db_session: AsyncSession, test_user: User, test_student: Student):
        data = LessonCreate(
            student_id=test_student.id,
            date=date.today() + timedelta(days=2),
            start_time=time(14, 0),
            end_time=time(15, 0),
        )
        lesson = await lesson_service.create_lesson(db_session, test_user.id, data)
        assert lesson.price == test_student.lesson_price

    async def test_create_lesson_with_time_conflict(self, db_session: AsyncSession, test_user: User, test_student: Student, test_lesson: Lesson):
        data = LessonCreate(
            student_id=test_student.id,
            date=test_lesson.date,
            start_time=time(10, 30),
            end_time=time(11, 30),
        )
        with pytest.raises(ValueError, match="Time conflict"):
            await lesson_service.create_lesson(db_session, test_user.id, data)

    async def test_create_lesson_student_not_found(self, db_session: AsyncSession, test_user: User):
        data = LessonCreate(
            student_id=uuid.uuid4(),
            date=date.today() + timedelta(days=1),
            start_time=time(14, 0),
            end_time=time(15, 0),
        )
        with pytest.raises(ValueError, match="Student not found"):
            await lesson_service.create_lesson(db_session, test_user.id, data)

    async def test_list_lessons(self, db_session: AsyncSession, test_user: User, test_lesson: Lesson):
        lessons, total = await lesson_service.list_lessons(db_session, test_user.id)
        assert total >= 1
        assert any(lesson.id == test_lesson.id for lesson in lessons)

    async def test_list_lessons_with_date_filter(self, db_session: AsyncSession, test_user: User, test_lesson: Lesson):
        lessons, total = await lesson_service.list_lessons(
            db_session, test_user.id, start_date=test_lesson.date, end_date=test_lesson.date
        )
        assert total >= 1

    async def test_update_lesson(self, db_session: AsyncSession, test_user: User, test_lesson: Lesson):
        from app.schemas.lesson import LessonUpdate
        data = LessonUpdate(price=75.0, comment="Updated comment")
        updated = await lesson_service.update_lesson(db_session, test_lesson.id, test_user.id, data)
        assert updated.price == 75.0
        assert updated.comment == "Updated comment"

    async def test_cancel_lesson(self, db_session: AsyncSession, test_user: User, test_lesson: Lesson):
        cancelled = await lesson_service.cancel_lesson(db_session, test_lesson.id, test_user.id)
        assert cancelled.status == "cancelled"

    async def test_reschedule_lesson(self, db_session: AsyncSession, test_user: User, test_lesson: Lesson):
        new_date = test_lesson.date + timedelta(days=7)
        data = LessonReschedule(date=new_date, start_time=time(9, 0), end_time=time(10, 0))
        rescheduled = await lesson_service.reschedule_lesson(db_session, test_lesson.id, test_user.id, data)
        assert rescheduled.date == new_date
        assert rescheduled.start_time == time(9, 0)

    async def test_update_payment_status(self, db_session: AsyncSession, test_user: User, test_lesson: Lesson):
        updated = await lesson_service.update_payment_status(
            db_session, test_lesson.id, test_user.id, "paid"
        )
        assert updated.payment_status == "paid"

    async def test_create_recurring_lessons(self, db_session: AsyncSession, test_user: User, test_lesson: Lesson):
        recurrence_data = RecurrenceCreate(
            recurrence_type="weekly",
            end_date=test_lesson.date + timedelta(weeks=4),
            total_occurrences=5,
        )
        lessons = await lesson_service.create_recurring(
            db_session, test_lesson.id, test_user.id, recurrence_data
        )
        assert len(lessons) == 5

    async def test_create_recurring_already_exists(self, db_session: AsyncSession, test_user: User, test_lesson: Lesson):
        recurrence_data = RecurrenceCreate(
            recurrence_type="weekly",
            end_date=test_lesson.date + timedelta(weeks=4),
            total_occurrences=5,
        )
        await lesson_service.create_recurring(db_session, test_lesson.id, test_user.id, recurrence_data)
        with pytest.raises(ValueError, match="Recurrence already exists"):
            await lesson_service.create_recurring(db_session, test_lesson.id, test_user.id, recurrence_data)
