from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.models.homework import HomeworkFile
from app.models.user import User
from app.schemas.homework import FileUploadResponse
from app.security.permissions import get_current_active_user, require_role
from app.services import storage_service

router = APIRouter(tags=["Files"])


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile,
    bucket: str = "general",
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    file_data = await storage_service.upload_file(file, bucket=bucket)
    return FileUploadResponse(
        id=UUID(int=0),
        file_url=file_data["url"],
        file_name=file_data["name"],
        file_type=file_data["type"],
        file_size=file_data["size"],
    )


@router.get("/{file_id}", response_model=FileUploadResponse)
async def get_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(HomeworkFile).where(HomeworkFile.id == file_id))
    hf = result.scalar_one_or_none()
    if not hf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileUploadResponse(
        id=hf.id,
        file_url=hf.file_url,
        file_name=hf.file_name,
        file_type=hf.file_type,
        file_size=hf.file_size,
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_role("tutor", "admin")),
):
    result = await db.execute(select(HomeworkFile).where(HomeworkFile.id == file_id))
    hf = result.scalar_one_or_none()
    if not hf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    rel_path = hf.file_url.removeprefix("/uploads/")
    await storage_service.delete_file(path=rel_path)
    await db.delete(hf)
    await db.flush()


@router.get("/{file_id}/download")
async def download_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(HomeworkFile).where(HomeworkFile.id == file_id))
    hf = result.scalar_one_or_none()
    if not hf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    rel_path = hf.file_url.removeprefix("/uploads/")
    full_path = storage_service.UPLOAD_DIR / rel_path
    if not full_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on disk")

    return FileResponse(
        path=str(full_path),
        filename=hf.file_name,
        media_type=hf.file_type,
    )
