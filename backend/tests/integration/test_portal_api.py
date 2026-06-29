from datetime import date, timedelta

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestPortalAPI:
    async def test_get_schedule(self, client: AsyncClient, test_student_user, test_portal_student):
        from app.security.jwt import create_access_token

        student_token = create_access_token({"sub": str(test_student_user.id)})
        student_hdrs = {"Authorization": f"Bearer {student_token}"}

        response = await client.get(
            "/api/v1/portal/schedule",
            params={"days": 30},
            headers=student_hdrs,
        )
        assert response.status_code == 200
        data = response.json()
        assert "lessons" in data

    async def test_get_homework(self, client: AsyncClient, test_student_user, test_portal_student, test_user, db_session):
        from app.models.homework import Homework

        homework = Homework(
            tutor_id=test_user.id,
            student_id=test_portal_student.id,
            title="Portal Homework",
            description="Complete worksheet",
            type="text",
            due_date=date.today() + timedelta(days=7),
            status="pending",
        )
        db_session.add(homework)
        await db_session.commit()

        from app.security.jwt import create_access_token

        student_token = create_access_token({"sub": str(test_student_user.id)})
        student_hdrs = {"Authorization": f"Bearer {student_token}"}

        response = await client.get(
            "/api/v1/portal/homework",
            headers=student_hdrs,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    async def test_get_history(self, client: AsyncClient, test_student_user, test_portal_student):
        from app.security.jwt import create_access_token

        student_token = create_access_token({"sub": str(test_student_user.id)})
        student_hdrs = {"Authorization": f"Bearer {student_token}"}

        response = await client.get(
            "/api/v1/portal/history",
            params={"page": 1, "per_page": 10},
            headers=student_hdrs,
        )
        assert response.status_code == 200
        data = response.json()
        assert "lessons" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data

    async def test_get_payments(self, client: AsyncClient, test_student_user, test_portal_student):
        from app.security.jwt import create_access_token

        student_token = create_access_token({"sub": str(test_student_user.id)})
        student_hdrs = {"Authorization": f"Bearer {student_token}"}

        response = await client.get(
            "/api/v1/portal/payments",
            headers=student_hdrs,
        )
        assert response.status_code == 200
        data = response.json()
        assert "payments" in data

    async def test_student_cannot_create_student(self, client: AsyncClient, test_student_user):
        from app.security.jwt import create_access_token

        student_token = create_access_token({"sub": str(test_student_user.id)})
        student_hdrs = {"Authorization": f"Bearer {student_token}"}

        response = await client.post(
            "/api/v1/students",
            json={
                "first_name": "No",
                "last_name": "Access",
                "subject": "Test",
                "lesson_price": 50.0,
            },
            headers=student_hdrs,
        )
        assert response.status_code == 403

    async def test_unauthorized_access(self, client: AsyncClient):
        response = await client.get("/api/v1/portal/schedule")
        assert response.status_code == 401

    async def test_tutor_cannot_access_portal(self, client: AsyncClient, auth_headers):
        response = await client.get(
            "/api/v1/portal/schedule",
            headers=auth_headers,
        )
        assert response.status_code == 403

    async def test_portal_student_not_found(self, client: AsyncClient, db_session):
        import uuid

        from app.models.user import User, UserProfile
        from app.security.jwt import create_access_token
        from app.security.password import hash_password

        user = User(
            id=uuid.uuid4(),
            email="no_student@test.com",
            password_hash=hash_password("Pass123!"),
            role="student",
            is_active=True,
        )
        db_session.add(user)
        profile = UserProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            first_name="No",
            last_name="Student",
        )
        db_session.add(profile)
        await db_session.commit()

        token = create_access_token({"sub": str(user.id)})
        hdrs = {"Authorization": f"Bearer {token}"}

        response = await client.get("/api/v1/portal/schedule", headers=hdrs)
        assert response.status_code == 404
