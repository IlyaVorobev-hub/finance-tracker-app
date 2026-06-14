import uuid
from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate, StudentUpdate
from app.services import student_service


@pytest.mark.asyncio
class TestStudentService:
    async def test_create_student(self, db_session: AsyncSession, test_user: User):
        data = StudentCreate(
            first_name="Jane",
            last_name="Smith",
            email="jane@email.com",
            phone="+1234567892",
            subject="Physics",
            lesson_price=60.0,
            notes="Advanced student",
        )
        student = await student_service.create_student(db_session, test_user.id, data)
        assert student.first_name == "Jane"
        assert student.last_name == "Smith"
        assert student.tutor_id == test_user.id
        assert student.lesson_price == Decimal("60.0")

    async def test_list_students(self, db_session: AsyncSession, test_user: User):
        for i in range(3):
            await student_service.create_student(
                db_session,
                test_user.id,
                StudentCreate(
                    first_name=f"Student{i}",
                    last_name="Test",
                    subject="Math",
                    lesson_price=50.0,
                ),
            )
        await db_session.commit()

        students, total = await student_service.list_students(db_session, test_user.id)
        assert total == 3
        assert len(students) == 3

    async def test_list_students_with_search(self, db_session: AsyncSession, test_user: User):
        await student_service.create_student(
            db_session,
            test_user.id,
            StudentCreate(first_name="Alice", last_name="Johnson", subject="Chemistry", lesson_price=55.0),
        )
        await student_service.create_student(
            db_session,
            test_user.id,
            StudentCreate(first_name="Bob", last_name="Williams", subject="Biology", lesson_price=45.0),
        )
        await db_session.commit()

        students, total = await student_service.list_students(db_session, test_user.id, search="Alice")
        assert total == 1
        assert students[0].first_name == "Alice"

    async def test_get_student(self, db_session: AsyncSession, test_user: User, test_student: Student):
        retrieved = await student_service.get_student(db_session, test_student.id, test_user.id)
        assert retrieved.id == test_student.id
        assert retrieved.first_name == "John"

    async def test_get_student_not_found(self, db_session: AsyncSession, test_user: User):
        with pytest.raises(ValueError, match="Student not found"):
            await student_service.get_student(db_session, uuid.uuid4(), test_user.id)

    async def test_update_student(self, db_session: AsyncSession, test_user: User, test_student: Student):
        data = StudentUpdate(first_name="Updated", subject="Advanced Math")
        updated = await student_service.update_student(db_session, test_student.id, test_user.id, data)
        assert updated.first_name == "Updated"
        assert updated.subject == "Advanced Math"

    async def test_delete_student(self, db_session: AsyncSession, test_user: User, test_student: Student):
        await student_service.delete_student(db_session, test_student.id, test_user.id)
        with pytest.raises(ValueError, match="Student not found"):
            await student_service.get_student(db_session, test_student.id, test_user.id)

    async def test_update_student_status(self, db_session: AsyncSession, test_user: User, test_student: Student):
        updated = await student_service.update_student_status(
            db_session, test_student.id, test_user.id, "paused"
        )
        assert updated.status == "paused"

    async def test_tutor_cannot_see_other_students(self, db_session: AsyncSession, test_user: User, test_student: Student):
        other_tutor_id = uuid.uuid4()
        with pytest.raises(ValueError, match="Student not found"):
            await student_service.get_student(db_session, test_student.id, other_tutor_id)
