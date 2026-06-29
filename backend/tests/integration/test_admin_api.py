import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


@pytest.mark.asyncio
class TestAdminAPI:
    async def test_get_system_stats(self, client: AsyncClient, admin_headers):
        response = await client.get("/api/v1/admin/stats", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_students" in data

    async def test_get_system_stats_unauthorized(self, client: AsyncClient, auth_headers):
        response = await client.get("/api/v1/admin/stats", headers=auth_headers)
        assert response.status_code == 403

    async def test_get_audit_logs(self, client: AsyncClient, admin_headers, db_session: AsyncSession):
        log = AuditLog(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            action="test_action",
            entity_type="test_entity",
            details={"key": "value"},
        )
        db_session.add(log)
        await db_session.commit()

        response = await client.get("/api/v1/admin/audit-logs", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    async def test_get_audit_logs_with_filters(self, client: AsyncClient, admin_headers, db_session: AsyncSession):
        log = AuditLog(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            action="login",
            entity_type="auth",
        )
        db_session.add(log)
        await db_session.commit()

        response = await client.get(
            "/api/v1/admin/audit-logs?action=login&entity_type=auth",
            headers=admin_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    async def test_get_audit_log_by_id(self, client: AsyncClient, admin_headers, db_session: AsyncSession):
        log = AuditLog(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            action="test",
            entity_type="test",
        )
        db_session.add(log)
        await db_session.commit()

        response = await client.get(f"/api/v1/admin/audit-logs/{log.id}", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["action"] == "test"

    async def test_get_audit_log_not_found(self, client: AsyncClient, admin_headers):
        response = await client.get(f"/api/v1/admin/audit-logs/{uuid.uuid4()}", headers=admin_headers)
        assert response.status_code == 404

    async def test_get_all_users_stats(self, client: AsyncClient, admin_headers):
        response = await client.get("/api/v1/admin/users/stats", headers=admin_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    async def test_get_user_stats(self, client: AsyncClient, admin_headers, test_user):
        response = await client.get(f"/api/v1/admin/users/{test_user.id}/stats", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "lessons_count" in data

    async def test_get_user_stats_not_found(self, client: AsyncClient, admin_headers):
        response = await client.get(f"/api/v1/admin/users/{uuid.uuid4()}/stats", headers=admin_headers)
        assert response.status_code == 404
