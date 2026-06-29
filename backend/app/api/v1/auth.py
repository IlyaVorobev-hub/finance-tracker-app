from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.schemas.auth import (
    PasswordChange,
    PasswordReset,
    PasswordResetRequest,
    TokenRefresh,
    TokenResponse,
    UserLogin,
    UserProfileResponse,
    UserRegister,
    UserResponse,
)
from app.security.permissions import get_current_active_user
from app.security.rate_limiter import limiter
from app.services import auth_service, user_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(
    request: Request,
    data: UserRegister,
    db: AsyncSession = Depends(get_db_session),
):
    user = await auth_service.register_user(db, data)
    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    data: UserLogin,
    db: AsyncSession = Depends(get_db_session),
):
    return await auth_service.login_user(db, data.email, data.password)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("10/minute")
async def refresh(
    request: Request,
    data: TokenRefresh,
    db: AsyncSession = Depends(get_db_session),
):
    return await auth_service.refresh_token_service(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
):
    await auth_service.logout_user(db, current_user.id)


@router.get("/me", response_model=UserResponse)
async def me(
    current_user=Depends(get_current_active_user),
):
    return current_user


@router.get("/me/profile", response_model=UserProfileResponse)
async def me_profile(
    current_user=Depends(get_current_active_user),
):
    return current_user.profile


@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    data: PasswordChange,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
):
    await user_service.change_password(db, current_user, data.old_password, data.new_password)


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("3/hour")
async def forgot_password(
    request: Request,
    data: PasswordResetRequest,
    db: AsyncSession = Depends(get_db_session),
):
    await auth_service.forgot_password(db, data.email)


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/hour")
async def reset_password(
    request: Request,
    data: PasswordReset,
    db: AsyncSession = Depends(get_db_session),
):
    await auth_service.reset_password(db, data.token, data.new_password)


@router.post("/verify-email", status_code=status.HTTP_204_NO_CONTENT)
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db_session),
):
    await auth_service.verify_email(db, token)


@router.post("/resend-verification", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("3/hour")
async def resend_verification(
    request: Request,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_session),
):
    await auth_service.resend_verification_email(db, current_user)
