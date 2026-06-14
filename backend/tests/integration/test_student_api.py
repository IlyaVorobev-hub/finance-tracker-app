import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestStudentAPI:
    async def test_create_student(self, client: AsyncClient, auth_headers):
        response = await client.post(
            "/api/v1/students",
            json={
                "first_name": "Alice",
                "last_name": "Brown",
                "email": "alice@email.com",
                "phone": "+1234567893",
                "subject": "Chemistry",
                "lesson_price": 55.0,
                "notes": "Enthusiastic learner",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["first_name"] == "Alice"
        assert data["subject"] == "Chemistry"
        assert data["lesson_price"] == 55.0

    async def test_list_students(self, client: AsyncClient, auth_headers):
        await client.post(
            "/api/v1/students",
            json={
                "first_name": "Bob",
                "last_name": "Wilson",
                "subject": "Biology",
                "lesson_price": 45.0,
            },
            headers=auth_headers,
        )

        response = await client.get("/api/v1/students", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "students" in data
        assert data["total"] >= 1

    async def test_list_students_with_search(self, client: AsyncClient, auth_headers):
        await client.post(
            "/api/v1/students",
            json={
                "first_name": "Searchable",
                "last_name": "Student",
                "subject": "Physics",
                "lesson_price": 50.0,
            },
            headers=auth_headers,
        )

        response = await client.get(
            "/api/v1/students",
            params={"search": "Searchable"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert any("Searchable" in s["first_name"] for s in data["students"])

    async def test_get_student(self, client: AsyncClient, auth_headers, test_student):
        response = await client.get(
            f"/api/v1/students/{test_student.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "John"

    async def test_update_student(self, client: AsyncClient, auth_headers, test_student):
        response = await client.put(
            f"/api/v1/students/{test_student.id}",
            json={"first_name": "Updated", "subject": "Advanced Math"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"

    async def test_delete_student(self, client: AsyncClient, admin_headers, test_user):
        create_response = await client.post(
            "/api/v1/students",
            json={
                "first_name": "ToDelete",
                "last_name": "Student",
                "subject": "Temp",
                "lesson_price": 30.0,
            },
            headers=admin_headers,
        )
        student_id = create_response.json()["id"]

        delete_response = await client.delete(
            f"/api/v1/students/{student_id}",
            headers=admin_headers,
        )
        assert delete_response.status_code == 204

    async def test_update_student_status(self, client: AsyncClient, auth_headers, test_student):
        response = await client.patch(
            f"/api/v1/students/{test_student.id}/status",
            json={"status": "paused"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "paused"

    async def test_student_cannot_access_other_students(self, client: AsyncClient, test_student, test_user):
        from app.security.jwt import create_access_token

        student_token = create_access_token({"sub": str(test_student.id)})
        student_hdrs = {"Authorization": f"Bearer {student_token}"}

        other_tutor_response = await client.get("/api/v1/students", headers=student_hdrs)
        assert other_tutor_response.status_code in [403, 401]

    async def test_unauthorized_access(self, client: AsyncClient):
        response = await client.get("/api/v1/students")
        assert response.status_code == 401

    async def test_student_cannot_delete(self, client: AsyncClient, student_headers, test_student):
        response = await client.delete(
            f"/api/v1/students/{test_student.id}",
            headers=student_headers,
        )
        assert response.status_code == 403
