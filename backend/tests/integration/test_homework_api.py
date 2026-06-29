import io
import uuid
from datetime import date, timedelta
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestHomeworkAPI:
    async def test_create_homework(self, client: AsyncClient, auth_headers, test_student):
        response = await client.post(
            "/api/v1/homework",
            json={
                "student_id": str(test_student.id),
                "title": "Practice Problems",
                "description": "Complete exercises 1-20",
                "type": "text",
                "due_date": str(date.today() + timedelta(days=7)),
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Practice Problems"
        assert data["status"] == "pending"

    async def test_create_homework_not_found(self, client: AsyncClient, auth_headers):
        response = await client.post(
            "/api/v1/homework",
            json={
                "student_id": str(uuid.uuid4()),
                "title": "Should Fail",
                "due_date": str(date.today() + timedelta(days=7)),
            },
            headers=auth_headers,
        )
        assert response.status_code == 400

    async def test_list_homework(self, client: AsyncClient, auth_headers, test_homework):
        response = await client.get("/api/v1/homework", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "homework" in data
        assert data["total"] >= 1

    async def test_list_homework_with_filters(self, client: AsyncClient, auth_headers, test_homework):
        response = await client.get(
            "/api/v1/homework",
            params={"status": "pending"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert all(h["status"] == "pending" for h in data["homework"])

    async def test_list_homework_with_student_filter(self, client: AsyncClient, auth_headers, test_homework, test_student):
        response = await client.get(
            "/api/v1/homework",
            params={"student_id": str(test_student.id)},
            headers=auth_headers,
        )
        assert response.status_code == 200

    async def test_get_homework(self, client: AsyncClient, auth_headers, test_homework):
        response = await client.get(
            f"/api/v1/homework/{test_homework.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Homework"

    async def test_get_homework_not_found(self, client: AsyncClient, auth_headers):
        response = await client.get(f"/api/v1/homework/{uuid.uuid4()}", headers=auth_headers)
        assert response.status_code == 404

    async def test_update_homework(self, client: AsyncClient, auth_headers, test_homework):
        response = await client.put(
            f"/api/v1/homework/{test_homework.id}",
            json={"title": "Updated Title", "status": "submitted"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["status"] == "submitted"

    async def test_update_homework_not_found(self, client: AsyncClient, auth_headers):
        response = await client.put(
            f"/api/v1/homework/{uuid.uuid4()}",
            json={"title": "Updated"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    async def test_archive_homework(self, client: AsyncClient, auth_headers, test_homework):
        response = await client.patch(
            f"/api/v1/homework/{test_homework.id}/archive",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "archived"

    async def test_archive_homework_not_found(self, client: AsyncClient, auth_headers):
        response = await client.patch(f"/api/v1/homework/{uuid.uuid4()}/archive", headers=auth_headers)
        assert response.status_code == 404

    async def test_delete_homework(self, client: AsyncClient, auth_headers, test_homework):
        response = await client.delete(
            f"/api/v1/homework/{test_homework.id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

    async def test_delete_homework_not_found(self, client: AsyncClient, auth_headers):
        response = await client.delete(f"/api/v1/homework/{uuid.uuid4()}", headers=auth_headers)
        assert response.status_code == 404

    @patch("app.api.v1.homework.storage_service.upload_file", new_callable=AsyncMock)
    async def test_upload_file(self, mock_upload, client: AsyncClient, auth_headers, test_homework):
        mock_upload.return_value = {
            "url": "https://storage.example.com/test.txt",
            "name": "test.txt",
            "type": "text/plain",
            "size": 18,
        }
        file_content = b"test file content"
        response = await client.post(
            f"/api/v1/homework/{test_homework.id}/files",
            files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["file_name"] == "test.txt"

    async def test_upload_file_not_found(self, client: AsyncClient, auth_headers):
        response = await client.post(
            f"/api/v1/homework/{uuid.uuid4()}/files",
            files={"file": ("test.txt", io.BytesIO(b"content"), "text/plain")},
            headers=auth_headers,
        )
        assert response.status_code in [400, 404]

    @patch("app.api.v1.homework.storage_service.upload_file", new_callable=AsyncMock)
    async def test_remove_file(self, mock_upload, client: AsyncClient, auth_headers, test_homework):
        mock_upload.return_value = {
            "url": "https://storage.example.com/test.txt",
            "name": "test.txt",
            "type": "text/plain",
            "size": 18,
        }
        file_content = b"test file content"
        upload_response = await client.post(
            f"/api/v1/homework/{test_homework.id}/files",
            files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")},
            headers=auth_headers,
        )
        file_id = upload_response.json()["id"]

        response = await client.delete(
            f"/api/v1/homework/{test_homework.id}/files/{file_id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

    async def test_remove_file_not_found(self, client: AsyncClient, auth_headers, test_homework):
        response = await client.delete(
            f"/api/v1/homework/{test_homework.id}/files/{uuid.uuid4()}",
            headers=auth_headers,
        )
        assert response.status_code == 404

    async def test_student_portal_homework(self, client: AsyncClient, test_student_user, test_portal_student, test_user, db_session):
        from app.models.homework import Homework

        homework = Homework(
            tutor_id=test_user.id,
            student_id=test_portal_student.id,
            title="Student Homework",
            description="Read chapter 3",
            type="text",
            due_date=date.today() + timedelta(days=5),
            status="pending",
        )
        db_session.add(homework)
        await db_session.commit()

        from app.security.jwt import create_access_token

        student_token = create_access_token({"sub": str(test_student_user.id)})
        student_hdrs = {"Authorization": f"Bearer {student_token}"}

        response = await client.get(
            f"/api/v1/homework/student/{test_portal_student.id}",
            headers=student_hdrs,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    async def test_student_cannot_view_other_student_homework(self, client: AsyncClient, test_student_user, test_student, test_user, db_session):
        from app.security.jwt import create_access_token

        student_token = create_access_token({"sub": str(test_student_user.id)})
        student_hdrs = {"Authorization": f"Bearer {student_token}"}

        response = await client.get(
            f"/api/v1/homework/student/{test_student.id}",
            headers=student_hdrs,
        )
        assert response.status_code == 403

    async def test_tutor_get_student_homework(self, client: AsyncClient, auth_headers, test_student, test_homework):
        response = await client.get(
            f"/api/v1/homework/student/{test_student.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200

    async def test_student_cannot_create_homework(self, client: AsyncClient, student_headers, test_student):
        response = await client.post(
            "/api/v1/homework",
            json={
                "student_id": str(test_student.id),
                "title": "Should Fail",
                "due_date": str(date.today() + timedelta(days=7)),
            },
            headers=student_headers,
        )
        assert response.status_code == 403

    async def test_unauthorized_access(self, client: AsyncClient):
        response = await client.get("/api/v1/homework")
        assert response.status_code == 401
