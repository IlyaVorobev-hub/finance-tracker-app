import os
import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException, status

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "jpg",
    "image/png": "png",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _validate_file(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' not allowed. Allowed: PDF, DOCX, JPG, PNG",
        )


async def _validate_file_size(file: UploadFile) -> int:
    contents = await file.read()
    size = len(contents)
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size {size} bytes exceeds maximum of {MAX_FILE_SIZE} bytes",
        )
    await file.seek(0)
    return size


async def upload_file(
    file: UploadFile,
    bucket: str = "homework",
    path: str = "",
) -> dict:
    _validate_file(file)
    file_size = await _validate_file_size(file)

    ext = ALLOWED_CONTENT_TYPES.get(file.content_type, "bin")
    filename = f"{uuid.uuid4()}.{ext}"
    rel_path = os.path.join(path, filename) if path else filename
    full_path = UPLOAD_DIR / rel_path
    full_path.parent.mkdir(parents=True, exist_ok=True)

    contents = await file.read()
    with open(full_path, "wb") as f:
        f.write(contents)

    file_url = f"/uploads/{rel_path}"
    return {
        "url": file_url,
        "name": file.filename or filename,
        "type": file.content_type or "application/octet-stream",
        "size": file_size,
    }


async def delete_file(bucket: str = "homework", path: str = "") -> None:
    full_path = UPLOAD_DIR / path
    if full_path.exists():
        os.remove(full_path)


async def get_signed_url(
    bucket: str = "homework",
    path: str = "",
    expires: int = 3600,
) -> str:
    full_path = UPLOAD_DIR / path
    if not full_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    return f"/uploads/{path}"
