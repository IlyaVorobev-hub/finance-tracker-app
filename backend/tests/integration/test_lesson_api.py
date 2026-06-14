from datetime import date, timedelta

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestLessonAPI:
    async def test_create_lesson(self, client: AsyncClient, auth_headers, test_student):
        response = await client.post(
            "/api/v1/lessons",
            json={
                "student_id": str(test_student.id),
                "date": str(date.today() + timedelta(days=1)),
                "start_time": "14:00:00",
                "end_time": "15:00:00",
                "price": 50.0,
                "comment": "Test lesson",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["student_id"] == str(test_student.id)
        assert data["price"] == 50.0
        assert data["status"] == "scheduled"

    async def test_create_lesson_conflict(self, client: AsyncClient, auth_headers, test_student, test_lesson):
        response = await client.post(
            "/api/v1/lessons",
            json={
                "student_id": str(test_student.id),
                "date": str(test_lesson.date),
                "start_time": "10:30:00",
                "end_time": "11:30:00",
            },
            headers=auth_headers,
        )
        assert response.status_code == 409

    async def test_list_lessons(self, client: AsyncClient, auth_headers, test_lesson):
        response = await client.get("/api/v1/lessons", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "lessons" in data
        assert data["total"] >= 1

    async def test_list_lessons_with_filters(self, client: AsyncClient, auth_headers, test_lesson):
        response = await client.get(
            "/api/v1/lessons",
            params={
                "start_date": str(test_lesson.date),
                "end_date": str(test_lesson.date),
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    async def test_update_lesson(self, client: AsyncClient, auth_headers, test_lesson):
        response = await client.put(
            f"/api/v1/lessons/{test_lesson.id}",
            json={"price": 75.0, "comment": "Updated lesson"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["price"] == 75.0

    async def test_cancel_lesson(self, client: AsyncClient, auth_headers, test_lesson):
        response = await client.delete(
            f"/api/v1/lessons/{test_lesson.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cancelled"

    async def test_reschedule_lesson(self, client: AsyncClient, auth_headers, test_lesson):
        new_date = str(test_lesson.date + timedelta(days=7))
        response = await client.patch(
            f"/api/v1/lessons/{test_lesson.id}/reschedule",
            json={
                "date": new_date,
                "start_time": "09:00:00",
                "end_time": "10:00:00",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["date"] == new_date

    async def test_update_payment(self, client: AsyncClient, auth_headers, test_lesson):
        response = await client.patch(
            f"/api/v1/lessons/{test_lesson.id}/payment",
            json={"payment_status": "paid"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["payment_status"] == "paid"

    async def test_calendar_view(self, client: AsyncClient, auth_headers, test_lesson):
        response = await client.get(
            "/api/v1/lessons/calendar",
            params={
                "start_date": str(date.today()),
                "end_date": str(date.today() + timedelta(days=30)),
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "lessons" in data
        assert "start_date" in data
        assert "end_date" in data

    async def test_student_cannot_create_lesson(self, client: AsyncClient, student_headers, test_student):
        response = await client.post(
            "/api/v1/lessons",
            json={
                "student_id": str(test_student.id),
                "date": str(date.today() + timedelta(days=1)),
                "start_time": "14:00:00",
                "end_time": "15:00:00",
            },
            headers=student_headers,
        )
        assert response.status_code == 403

    async def test_unauthorized_access(self, client: AsyncClient):
        response = await client.get("/api/v1/lessons")
        assert response.status_code == 401
