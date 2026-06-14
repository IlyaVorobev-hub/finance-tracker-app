import uuid
from enum import Enum

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.security.jwt import verify_token


class Role(str, Enum):
    super_admin = "super_admin"
    admin = "admin"
    tutor = "tutor"
    student = "student"


PERMISSIONS: dict[str, list[str]] = {
    Role.super_admin: ["*"],
    Role.admin: [
        "users:read",
        "users:write",
        "users:delete",
        "students:read",
        "students:write",
        "students:delete",
        "lessons:read",
        "lessons:write",
        "lessons:delete",
        "finance:read",
        "finance:write",
        "finance:delete",
        "homework:read",
        "homework:write",
        "homework:delete",
        "admin:read",
    ],
    Role.tutor: [
        "students:read",
        "students:write",
        "lessons:read",
        "lessons:write",
        "lessons:delete",
        "finance:read",
        "homework:read",
        "homework:write",
        "homework:delete",
    ],
    Role.student: [
        "portal:read",
    ],
}


def has_permission(role: str, permission: str) -> bool:
    perms = PERMISSIONS.get(role, [])
    if "*" in perms:
        return True
    return permission in perms


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db_session),
):
    from app.models.user import User

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    token_type = payload.get("type")
    if token_type != "access":
        raise credentials_exception
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user=Depends(get_current_user),
):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return current_user


def require_role(*roles: str):
    async def role_checker(
        current_user=Depends(get_current_active_user),
    ):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' not in required roles: {roles}",
            )
        return current_user
    return role_checker


def require_permission(permission: str):
    async def permission_checker(
        current_user=Depends(get_current_active_user),
    ):
        if not has_permission(current_user.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission}",
            )
        return current_user
    return permission_checker
