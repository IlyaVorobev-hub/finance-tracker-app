import io

import pytest
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

from app.services import storage_service


def _make_upload_file(filename: str, content: bytes, content_type: str) -> UploadFile:
    headers = Headers({"content-type": content_type})
    return UploadFile(filename=filename, file=io.BytesIO(content), headers=headers)


class TestStorageService:
    async def test_upload_file_pdf(self):
        file = _make_upload_file("test.pdf", b"%PDF-1.4 test content", "application/pdf")
        result = await storage_service.upload_file(file, bucket="homework")
        assert result["name"] == "test.pdf"
        assert result["type"] == "application/pdf"
        assert result["size"] == len(b"%PDF-1.4 test content")
        assert result["url"].startswith("/uploads/")

    async def test_upload_file_invalid_type(self):
        file = _make_upload_file("test.exe", b"test content", "application/octet-stream")
        with pytest.raises(HTTPException) as exc_info:
            await storage_service.upload_file(file)
        assert exc_info.value.status_code == 400

    async def test_upload_file_with_path(self):
        file = _make_upload_file("doc.pdf", b"%PDF-1.4 content", "application/pdf")
        result = await storage_service.upload_file(file, bucket="homework", path="subfolder")
        assert "subfolder" in result["url"]

    async def test_delete_file_nonexistent(self):
        await storage_service.delete_file(path="nonexistent.pdf")

    async def test_get_signed_url_not_found(self):
        with pytest.raises(HTTPException) as exc_info:
            await storage_service.get_signed_url(path="nonexistent.pdf")
        assert exc_info.value.status_code == 404

    async def test_get_signed_url_found(self):
        file = _make_upload_file("test.pdf", b"%PDF-1.4 content", "application/pdf")
        result = await storage_service.upload_file(file)
        rel_path = result["url"].removeprefix("/uploads/")
        url = await storage_service.get_signed_url(path=rel_path)
        assert url == result["url"]
