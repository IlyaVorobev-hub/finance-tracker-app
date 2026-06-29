import os
import uuid
from pathlib import Path, PurePosixPath

from fastapi import HTTPException, UploadFile, status

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAGIC_BYTES = {
    "application/pdf": b"%PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": b"PK\x03\x04",
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG",
}

ALLOWED_CONTENT_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "jpg",
    "image/png": "png",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _sanitize_path(user_path: str) -> str:
    normalized = PurePosixPath(user_path).parts
    clean = Path(*normalized) if normalized else Path()
    resolved = (UPLOAD_DIR / clean).resolve()
    if not str(resolved).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path",
        )
    return str(clean)


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
    if file.content_type in MAGIC_BYTES:
        expected = MAGIC_BYTES[file.content_type]
        if not contents.startswith(expected):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File content does not match declared type '{file.content_type}'",
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
    if path:
        clean_path = _sanitize_path(path)
        rel_path = str(Path(clean_path) / filename)
    else:
        rel_path = filename
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
    clean = _sanitize_path(path)
    full_path = UPLOAD_DIR / clean
    if full_path.exists():
        os.remove(full_path)


async def get_signed_url(
    bucket: str = "homework",
    path: str = "",
    expires: int = 3600,
) -> str:
    clean = _sanitize_path(path)
    full_path = UPLOAD_DIR / clean
    if not full_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    return f"/uploads/{clean}"
