import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestAuthAPI:
    async def test_register_user(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@test.com",
                "password": "SecurePass123!",
                "first_name": "New",
                "last_name": "User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@test.com"
        assert data["role"] == "tutor"
        assert data["is_active"] is True

    async def test_register_duplicate_email(self, client: AsyncClient, test_user):
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "tutor@test.com",
                "password": "SecurePass123!",
                "first_name": "Duplicate",
                "last_name": "User",
            },
        )
        assert response.status_code == 409

    async def test_login_success(self, client: AsyncClient, test_user):
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "tutor@test.com",
                "password": "TestPass123!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "tutor@test.com",
                "password": "WrongPassword",
            },
        )
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "Password123!",
            },
        )
        assert response.status_code == 401

    async def test_refresh_token(self, client: AsyncClient, test_user):
        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "tutor@test.com",
                "password": "TestPass123!",
            },
        )
        refresh_token = login_response.json()["refresh_token"]

        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_refresh_invalid_token(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid-token"},
        )
        assert response.status_code == 401

    async def test_get_current_user(self, client: AsyncClient, test_user, auth_headers):
        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "tutor@test.com"

    async def test_get_current_user_no_token(self, client: AsyncClient):
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_change_password(self, client: AsyncClient, test_user, auth_headers):
        response = await client.put(
            "/api/v1/auth/password",
            json={
                "old_password": "TestPass123!",
                "new_password": "NewSecurePass456!",
            },
            headers=auth_headers,
        )
        assert response.status_code == 204

    async def test_change_password_wrong_old(self, client: AsyncClient, test_user, auth_headers):
        response = await client.put(
            "/api/v1/auth/password",
            json={
                "old_password": "WrongOldPassword",
                "new_password": "NewSecurePass456!",
            },
            headers=auth_headers,
        )
        assert response.status_code == 400
