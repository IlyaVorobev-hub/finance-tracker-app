import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.services import audit_service


@pytest.mark.asyncio
class TestAuditService:
    async def test_log_action(self, db_session: AsyncSession):
        user_id = uuid.uuid4()
        log = await audit_service.log_action(
            db_session,
            user_id=user_id,
            action="create",
            entity_type="student",
            entity_id=uuid.uuid4(),
            details={"name": "Test Student"},
            ip="127.0.0.1",
        )
        assert log.user_id == user_id
        assert log.action == "create"
        assert log.entity_type == "student"
        assert log.details == {"name": "Test Student"}
        assert log.ip_address == "127.0.0.1"

    async def test_log_action_minimal(self, db_session: AsyncSession):
        user_id = uuid.uuid4()
        log = await audit_service.log_action(
            db_session,
            user_id=user_id,
            action="login",
            entity_type="auth",
        )
        assert log.user_id == user_id
        assert log.action == "login"
        assert log.entity_type == "auth"
        assert log.entity_id is None
        assert log.details is None
        assert log.ip_address is None
