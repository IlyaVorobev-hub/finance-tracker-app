import pytest
from httpx import AsyncClient

from app.security.jwt import create_email_verification_token, create_password_reset_token


@pytest.mark.asyncio
class TestPasswordReset:
    async def test_forgot_password_sends_email(self, client: AsyncClient, test_user):
        response = await client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "tutor@test.com"},
        )
        assert response.status_code == 204

    async def test_forgot_password_nonexistent_email(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "nonexistent@test.com"},
        )
        assert response.status_code == 204

    async def test_reset_password_success(self, client: AsyncClient, test_user):
        token = create_password_reset_token(str(test_user.id), test_user.email)
        response = await client.post(
            "/api/v1/auth/reset-password",
            json={
                "token": token,
                "new_password": "NewResetPass123!",
            },
        )
        assert response.status_code == 204

        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "tutor@test.com",
                "password": "NewResetPass123!",
            },
        )
        assert login_response.status_code == 200

    async def test_reset_password_invalid_token(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/reset-password",
            json={
                "token": "invalid-token",
                "new_password": "NewPass123!",
            },
        )
        assert response.status_code == 400

    async def test_reset_password_weak_password(self, client: AsyncClient, test_user):
        token = create_password_reset_token(str(test_user.id), test_user.email)
        response = await client.post(
            "/api/v1/auth/reset-password",
            json={
                "token": token,
                "new_password": "weak",
            },
        )
        assert response.status_code == 400

    async def test_reset_password_invalidates_old_sessions(
        self, client: AsyncClient, test_user, auth_headers
    ):
        token = create_password_reset_token(str(test_user.id), test_user.email)
        await client.post(
            "/api/v1/auth/reset-password",
            json={
                "token": token,
                "new_password": "NewResetPass456!",
            },
        )

        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200

        login_response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "old-refresh-token"},
        )
        assert login_response.status_code == 401


@pytest.mark.asyncio
class TestEmailVerification:
    async def test_verify_email_success(self, client: AsyncClient, test_user):
        token = create_email_verification_token(str(test_user.id), test_user.email)
        response = await client.post(
            f"/api/v1/auth/verify-email?token={token}",
        )
        assert response.status_code == 204

    async def test_verify_email_invalid_token(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/verify-email?token=invalid-token",
        )
        assert response.status_code == 400

    async def test_resend_verification(self, client: AsyncClient, test_user, auth_headers):
        response = await client.post(
            "/api/v1/auth/resend-verification",
            headers=auth_headers,
        )
        assert response.status_code == 204

    async def test_resend_verification_already_verified(
        self, client: AsyncClient, test_user, auth_headers
    ):
        token = create_email_verification_token(str(test_user.id), test_user.email)
        await client.post(f"/api/v1/auth/verify-email?token={token}")

        response = await client.post(
            "/api/v1/auth/resend-verification",
            headers=auth_headers,
        )
        assert response.status_code == 400
