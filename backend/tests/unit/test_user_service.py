import uuid

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services import user_service


@pytest.mark.asyncio
class TestUserService:
    async def test_list_users(self, db_session: AsyncSession, test_user: User):
        users, total = await user_service.list_users(db_session)
        assert total >= 1
        assert any(u.id == test_user.id for u in users)

    async def test_list_users_with_pagination(self, db_session: AsyncSession, test_user: User):
        users, total = await user_service.list_users(db_session, skip=0, limit=1)
        assert len(users) <= 1
        assert total >= 1

    async def test_get_user(self, db_session: AsyncSession, test_user: User):
        user = await user_service.get_user(db_session, test_user.id)
        assert user.id == test_user.id
        assert user.email == test_user.email

    async def test_get_user_not_found(self, db_session: AsyncSession):
        with pytest.raises(HTTPException) as exc_info:
            await user_service.get_user(db_session, uuid.uuid4())
        assert exc_info.value.status_code == 404

    async def test_create_user(self, db_session: AsyncSession):
        data = UserCreate(
            email="newuser@test.com",
            password="SecurePass123!",
            first_name="New",
            last_name="User",
            role="tutor",
        )
        user = await user_service.create_user(db_session, data)
        assert user.email == "newuser@test.com"
        assert user.role == "tutor"
        assert user.is_active is True

    async def test_create_user_duplicate_email(self, db_session: AsyncSession, test_user: User):
        data = UserCreate(
            email="tutor@test.com",
            password="SecurePass123!",
            first_name="Duplicate",
            last_name="User",
            role="tutor",
        )
        with pytest.raises(HTTPException) as exc_info:
            await user_service.create_user(db_session, data)
        assert exc_info.value.status_code == 409

    async def test_update_user(self, db_session: AsyncSession, test_user: User):
        data = UserUpdate(email="updated@test.com")
        updated = await user_service.update_user(db_session, test_user.id, data)
        assert updated.email == "updated@test.com"

    async def test_update_user_role(self, db_session: AsyncSession, test_user: User):
        updated = await user_service.update_user_role(db_session, test_user.id, "admin")
        assert updated.role == "admin"

    async def test_update_user_status(self, db_session: AsyncSession, test_user: User):
        updated = await user_service.update_user_status(db_session, test_user.id, False)
        assert updated.is_active is False

    async def test_delete_user(self, db_session: AsyncSession, test_user: User):
        await user_service.delete_user(db_session, test_user.id)
        user = await user_service.get_user(db_session, test_user.id)
        assert user.is_active is False
        assert user.email.startswith("deleted_")

    async def test_change_password(self, db_session: AsyncSession, test_user: User):
        await user_service.change_password(db_session, test_user, "TestPass123!", "NewPass456!")
        user = await user_service.get_user(db_session, test_user.id)
        from app.security.password import verify_password
        assert verify_password("NewPass456!", user.password_hash)

    async def test_change_password_wrong_old(self, db_session: AsyncSession, test_user: User):
        with pytest.raises(HTTPException) as exc_info:
            await user_service.change_password(db_session, test_user, "WrongPass", "NewPass456!")
        assert exc_info.value.status_code == 400
