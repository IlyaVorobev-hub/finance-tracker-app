import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserProfile
from app.schemas.user import UserCreate, UserUpdate
from app.security.password import hash_password


async def list_users(db: AsyncSession, skip: int = 0, limit: int = 20) -> tuple[list[User], int]:
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar_one()
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = list(result.scalars().all())
    return users, total


async def get_user(db: AsyncSession, user_id: uuid.UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    email = data.email.lower()
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        email=email,
        password_hash=hash_password(data.password),
        role=data.role,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    profile = UserProfile(
        user_id=user.id,
        first_name=data.first_name,
        last_name=data.last_name,
    )
    db.add(profile)
    await db.flush()
    await db.refresh(user)
    return user


async def update_user(db: AsyncSession, user_id: uuid.UUID, data: UserUpdate) -> User:
    user = await get_user(db, user_id)
    if data.email is not None:
        new_email = data.email.lower()
        if new_email != user.email:
            existing = await db.execute(select(User).where(User.email == new_email))
            if existing.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered",
                )
            user.email = new_email
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    await db.flush()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: uuid.UUID) -> None:
    user = await get_user(db, user_id)
    if user.role == "super_admin":
        count_result = await db.execute(
            select(func.count()).select_from(User).where(
                User.role == "super_admin", User.is_active == True  # noqa: E712
            )
        )
        if count_result.scalar_one() <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last super_admin",
            )
    user.is_active = False
    user.email = f"deleted_{user.id}@removed.local"
    user.token_version += 1
    await db.flush()


async def update_user_role(db: AsyncSession, user_id: uuid.UUID, role: str) -> User:
    user = await get_user(db, user_id)
    if user.role == "super_admin" and role != "super_admin":
        count_result = await db.execute(
            select(func.count()).select_from(User).where(
                User.role == "super_admin", User.is_active == True  # noqa: E712
            )
        )
        if count_result.scalar_one() <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the last super_admin",
            )
    user.role = role
    user.token_version += 1
    await db.flush()
    await db.refresh(user)
    return user


async def update_user_status(db: AsyncSession, user_id: uuid.UUID, is_active: bool) -> User:
    user = await get_user(db, user_id)
    if user.role == "super_admin" and not is_active:
        count_result = await db.execute(
            select(func.count()).select_from(User).where(
                User.role == "super_admin", User.is_active == True  # noqa: E712
            )
        )
        if count_result.scalar_one() <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate the last active super_admin",
            )
    user.is_active = is_active
    user.token_version += 1
    await db.flush()
    await db.refresh(user)
    return user


async def change_password(
    db: AsyncSession, user: User, old_password: str, new_password: str
) -> None:
    from app.security.password import hash_password, validate_password_strength, verify_password

    if not verify_password(old_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password",
        )
    validate_password_strength(new_password)
    user.password_hash = hash_password(new_password)
    user.token_version += 1
    await db.flush()
