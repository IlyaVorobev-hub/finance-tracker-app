import uuid

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestUsersAPI:
    async def test_list_users(self, client: AsyncClient, admin_headers, test_user):
        response = await client.get("/api/v1/users", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert any(u["email"] == "tutor@test.com" for u in data["users"])

    async def test_list_users_unauthorized(self, client: AsyncClient, auth_headers):
        response = await client.get("/api/v1/users", headers=auth_headers)
        assert response.status_code == 403

    async def test_get_user(self, client: AsyncClient, admin_headers, test_user):
        response = await client.get(f"/api/v1/users/{test_user.id}", headers=admin_headers)
        assert response.status_code == 200
        assert response.json()["email"] == "tutor@test.com"

    async def test_get_user_not_found(self, client: AsyncClient, admin_headers):
        response = await client.get(f"/api/v1/users/{uuid.uuid4()}", headers=admin_headers)
        assert response.status_code == 404

    async def test_create_user(self, client: AsyncClient, super_admin_headers):
        response = await client.post(
            "/api/v1/users",
            json={
                "email": "created@test.com",
                "password": "SecurePass123!",
                "first_name": "Created",
                "last_name": "User",
                "role": "tutor",
            },
            headers=super_admin_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "created@test.com"
        assert data["role"] == "tutor"

    async def test_create_user_requires_super_admin(self, client: AsyncClient, admin_headers):
        response = await client.post(
            "/api/v1/users",
            json={
                "email": "new@test.com",
                "password": "SecurePass123!",
                "first_name": "New",
                "last_name": "User",
                "role": "tutor",
            },
            headers=admin_headers,
        )
        assert response.status_code == 403

    async def test_update_user(self, client: AsyncClient, admin_headers, test_user):
        response = await client.put(
            f"/api/v1/users/{test_user.id}",
            json={"email": "updated@test.com"},
            headers=admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["email"] == "updated@test.com"

    async def test_delete_user(self, client: AsyncClient, super_admin_headers, test_user):
        response = await client.delete(f"/api/v1/users/{test_user.id}", headers=super_admin_headers)
        assert response.status_code == 204

    async def test_update_user_role(self, client: AsyncClient, super_admin_headers, test_user):
        response = await client.put(
            f"/api/v1/users/{test_user.id}/role",
            json={"role": "admin"},
            headers=super_admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["role"] == "admin"

    async def test_update_user_status(self, client: AsyncClient, super_admin_headers, test_user):
        response = await client.put(
            f"/api/v1/users/{test_user.id}/status",
            json={"is_active": False},
            headers=super_admin_headers,
        )
        assert response.status_code == 200
        assert response.json()["is_active"] is False
