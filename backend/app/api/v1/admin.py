import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.schemas.admin import (
    AuditLogListResponse,
    AuditLogResponse,
    SystemStats,
    UserStats,
)
from app.security.permissions import require_role
from app.services import admin_service

router = APIRouter(tags=["Admin"])


@router.get("/stats", response_model=SystemStats)
async def get_system_stats(
    _current_user=Depends(require_role("super_admin", "admin")),
    db: AsyncSession = Depends(get_db_session),
):
    return await admin_service.get_system_stats(db)


@router.get("/audit-logs", response_model=AuditLogListResponse)
async def list_audit_logs(
    user_id: uuid.UUID | None = Query(None),
    action: str | None = Query(None),
    entity_type: str | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _current_user=Depends(require_role("super_admin", "admin")),
    db: AsyncSession = Depends(get_db_session),
):
    logs, total = await admin_service.get_audit_logs(
        db,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        start_date=start_date,
        end_date=end_date,
        page=page,
        per_page=per_page,
    )
    return AuditLogListResponse(
        logs=[AuditLogResponse.model_validate(log) for log in logs],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/audit-logs/{log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    log_id: uuid.UUID,
    _current_user=Depends(require_role("super_admin", "admin")),
    db: AsyncSession = Depends(get_db_session),
):
    from sqlalchemy import select

    from app.models.audit_log import AuditLog

    result = await db.execute(select(AuditLog).where(AuditLog.id == log_id))
    log = result.scalar_one_or_none()
    if log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )
    return AuditLogResponse.model_validate(log)


@router.get("/users/stats", response_model=list[UserStats])
async def get_all_users_stats(
    _current_user=Depends(require_role("super_admin", "admin")),
    db: AsyncSession = Depends(get_db_session),
):
    return await admin_service.get_all_users_stats(db)


@router.get("/users/{user_id}/stats", response_model=UserStats)
async def get_user_stats(
    user_id: uuid.UUID,
    _current_user=Depends(require_role("super_admin", "admin")),
    db: AsyncSession = Depends(get_db_session),
):
    from sqlalchemy import select

    from app.models.user import User

    user_result = await db.execute(select(User).where(User.id == user_id))
    if user_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return await admin_service.get_user_stats(db, user_id)
