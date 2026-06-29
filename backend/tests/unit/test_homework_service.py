import uuid
from datetime import date, timedelta

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.homework import Homework
from app.models.student import Student
from app.models.user import User
from app.schemas.homework import HomeworkCreate, HomeworkUpdate
from app.services import homework_service


@pytest.mark.asyncio
class TestHomeworkService:
    async def test_create_homework(self, db_session: AsyncSession, test_user: User, test_student: Student):
        data = HomeworkCreate(
            student_id=test_student.id,
            title="Algebra Problems",
            description="Complete chapter 5",
            type="text",
            due_date=date.today() + timedelta(days=7),
        )
        hw = await homework_service.create_homework(db_session, test_user.id, data)
        assert hw.title == "Algebra Problems"
        assert hw.student_id == test_student.id
        assert hw.tutor_id == test_user.id
        assert hw.status == "pending"

    async def test_create_homework_student_not_found(self, db_session: AsyncSession, test_user: User):
        data = HomeworkCreate(
            student_id=uuid.uuid4(),
            title="Test",
            due_date=date.today() + timedelta(days=7),
        )
        with pytest.raises(ValueError, match="Student not found"):
            await homework_service.create_homework(db_session, test_user.id, data)

    async def test_list_homework(self, db_session: AsyncSession, test_user: User, test_homework: Homework):
        homeworks, total = await homework_service.list_homework(db_session, test_user.id)
        assert total >= 1
        assert any(h.id == test_homework.id for h in homeworks)

    async def test_list_homework_with_status_filter(self, db_session: AsyncSession, test_user: User, test_homework: Homework):
        homeworks, total = await homework_service.list_homework(
            db_session, test_user.id, status_filter="pending"
        )
        assert total >= 1
        assert all(h.status == "pending" for h in homeworks)

    async def test_list_homework_with_student_filter(self, db_session: AsyncSession, test_user: User, test_homework: Homework):
        homeworks, total = await homework_service.list_homework(
            db_session, test_user.id, student_id=test_homework.student_id
        )
        assert total >= 1
        assert all(h.student_id == test_homework.student_id for h in homeworks)

    async def test_get_homework(self, db_session: AsyncSession, test_user: User, test_homework: Homework):
        hw = await homework_service.get_homework(db_session, test_homework.id, test_user.id)
        assert hw.id == test_homework.id

    async def test_get_homework_not_found(self, db_session: AsyncSession, test_user: User):
        with pytest.raises(ValueError, match="Homework not found"):
            await homework_service.get_homework(db_session, uuid.uuid4(), test_user.id)

    async def test_update_homework(self, db_session: AsyncSession, test_user: User, test_homework: Homework):
        data = HomeworkUpdate(title="Updated Title", status="submitted")
        updated = await homework_service.update_homework(db_session, test_homework.id, test_user.id, data)
        assert updated.title == "Updated Title"
        assert updated.status == "submitted"

    async def test_archive_homework(self, db_session: AsyncSession, test_user: User, test_homework: Homework):
        archived = await homework_service.archive_homework(db_session, test_homework.id, test_user.id)
        assert archived.status == "archived"

    async def test_add_file(self, db_session: AsyncSession, test_user: User, test_homework: Homework):
        file_data = {
            "url": "https://storage.example.com/file.pdf",
            "name": "assignment.pdf",
            "type": "application/pdf",
            "size": 1024,
        }
        hf = await homework_service.add_file(db_session, test_homework.id, test_user.id, file_data)
        assert hf.file_url == file_data["url"]
        assert hf.file_name == file_data["name"]
        assert hf.file_size == 1024

    async def test_remove_file(self, db_session: AsyncSession, test_user: User, test_homework: Homework):
        file_data = {
            "url": "https://storage.example.com/file.pdf",
            "name": "assignment.pdf",
            "type": "application/pdf",
            "size": 1024,
        }
        hf = await homework_service.add_file(db_session, test_homework.id, test_user.id, file_data)
        await homework_service.remove_file(db_session, hf.id, test_user.id)
        hw = await homework_service.get_homework(db_session, test_homework.id, test_user.id)
        assert len(hw.files) == 0

    async def test_remove_file_not_found(self, db_session: AsyncSession, test_user: User):
        with pytest.raises(ValueError, match="File not found"):
            await homework_service.remove_file(db_session, uuid.uuid4(), test_user.id)

    async def test_get_student_homework(self, db_session: AsyncSession, test_user: User, test_student: Student, test_homework: Homework):
        homeworks = await homework_service.get_student_homework(db_session, test_student.id)
        assert len(homeworks) >= 1
        assert any(h.id == test_homework.id for h in homeworks)
