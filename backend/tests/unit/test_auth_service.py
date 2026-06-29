import uuid
from datetime import timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.security.jwt import create_access_token, create_refresh_token, decode_refresh_token, decode_token, verify_token
from app.security.password import hash_password, verify_password
from app.services import auth_service


class TestPassword:
    def test_hash_password(self):
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert hashed != password
        assert len(hashed) > 0

    def test_verify_password_correct(self):
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert verify_password("WrongPassword", hashed) is False


class TestJWT:
    def test_create_access_token(self):
        data = {"sub": "test-user-id"}
        token = create_access_token(data)
        assert token is not None
        assert len(token) > 0

    def test_create_access_token_with_custom_expiry(self):
        data = {"sub": "test-user-id"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta)
        payload = decode_token(token)
        assert payload["sub"] == "test-user-id"
        assert payload["type"] == "access"

    def test_create_refresh_token(self):
        data = {"sub": "test-user-id"}
        token = create_refresh_token(data)
        assert token is not None
        assert len(token) > 0

    def test_create_refresh_token_with_custom_expiry(self):
        data = {"sub": "test-user-id"}
        expires_delta = timedelta(days=14)
        token = create_refresh_token(data, expires_delta)
        payload = decode_refresh_token(token)
        assert payload["sub"] == "test-user-id"
        assert payload["type"] == "refresh"

    def test_verify_token_valid(self):
        data = {"sub": "test-user-id"}
        token = create_access_token(data)
        payload = verify_token(token)
        assert payload is not None
        assert payload["sub"] == "test-user-id"

    def test_verify_token_invalid(self):
        payload = verify_token("invalid-token-string")
        assert payload is None

    def test_decode_token_valid(self):
        data = {"sub": "test-user-id"}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload["sub"] == "test-user-id"
        assert payload["type"] == "access"

    def test_decode_token_invalid(self):
        with pytest.raises(ValueError):
            decode_token("invalid-token-string")


@pytest.mark.asyncio
class TestAuthService:
    async def test_refresh_token_service_valid(self, db_session: AsyncSession, test_user: User):
        token_data = {"sub": str(test_user.id), "type": "refresh"}
        refresh_token = create_refresh_token(token_data)
        result = await auth_service.refresh_token_service(db_session, refresh_token)
        assert result.access_token is not None
        assert result.refresh_token is not None

    async def test_refresh_token_service_invalid_token(self, db_session: AsyncSession):
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_token_service(db_session, "invalid-token")
        assert exc_info.value.status_code == 401

    async def test_refresh_token_service_not_refresh_type(self, db_session: AsyncSession, test_user: User):
        token_data = {"sub": str(test_user.id), "type": "access"}
        access_token = create_access_token(token_data)
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_token_service(db_session, access_token)
        assert exc_info.value.status_code == 401

    async def test_refresh_token_service_no_sub(self, db_session: AsyncSession):
        token_data = {"type": "refresh"}
        token = create_refresh_token(token_data)
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_token_service(db_session, token)
        assert exc_info.value.status_code == 401

    async def test_refresh_token_service_invalid_user_id(self, db_session: AsyncSession):
        token_data = {"sub": "not-a-uuid", "type": "refresh"}
        token = create_refresh_token(token_data)
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_token_service(db_session, token)
        assert exc_info.value.status_code == 401

    async def test_refresh_token_service_inactive_user(self, db_session: AsyncSession):
        user = User(
            id=uuid.uuid4(),
            email="inactive@test.com",
            password_hash=hash_password("Pass123!"),
            role="tutor",
            is_active=False,
        )
        db_session.add(user)
        await db_session.commit()

        token_data = {"sub": str(user.id), "type": "refresh"}
        token = create_refresh_token(token_data)
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.refresh_token_service(db_session, token)
        assert exc_info.value.status_code == 401

    async def test_get_current_user_service_valid(self, db_session: AsyncSession, test_user: User):
        token = create_access_token({"sub": str(test_user.id)})
        user = await auth_service.get_current_user_service(db_session, token)
        assert user.id == test_user.id

    async def test_get_current_user_service_invalid_token(self, db_session: AsyncSession):
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user_service(db_session, "invalid-token")
        assert exc_info.value.status_code == 401

    async def test_get_current_user_service_no_sub(self, db_session: AsyncSession):
        token = create_access_token({})
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user_service(db_session, token)
        assert exc_info.value.status_code == 401

    async def test_get_current_user_service_invalid_uuid(self, db_session: AsyncSession):
        token = create_access_token({"sub": "not-a-uuid"})
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user_service(db_session, token)
        assert exc_info.value.status_code == 401

    async def test_get_current_user_service_user_not_found(self, db_session: AsyncSession):
        token = create_access_token({"sub": str(uuid.uuid4())})
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user_service(db_session, token)
        assert exc_info.value.status_code == 401

    async def test_logout_user(self, db_session: AsyncSession, test_user: User):
        await auth_service.logout_user(db_session, test_user.id)
