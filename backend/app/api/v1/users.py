import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.schemas.user import (
    UserCreate,
    UserListResponse,
    UserResponse,
    UserRoleUpdate,
    UserStatusUpdate,
    UserUpdate,
)
from app.security.permissions import require_role
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=UserListResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    _current_user=Depends(require_role("super_admin", "admin")),
    db: AsyncSession = Depends(get_db_session),
):
    users, total = await user_service.list_users(db, skip=skip, limit=limit)
    return UserListResponse(
        users=[UserResponse.model_validate(u) for u in users],
        total=total,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    _current_user=Depends(require_role("super_admin", "admin")),
    db: AsyncSession = Depends(get_db_session),
):
    user = await user_service.get_user(db, user_id)
    return user


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    _current_user=Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db_session),
):
    return await user_service.create_user(db, data)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    _current_user=Depends(require_role("super_admin", "admin")),
    db: AsyncSession = Depends(get_db_session),
):
    return await user_service.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    _current_user=Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db_session),
):
    await user_service.delete_user(db, user_id)


@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: uuid.UUID,
    data: UserRoleUpdate,
    _current_user=Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db_session),
):
    return await user_service.update_user_role(db, user_id, data.role)


@router.put("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: uuid.UUID,
    data: UserStatusUpdate,
    _current_user=Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db_session),
):
    return await user_service.update_user_status(db, user_id, data.is_active)
