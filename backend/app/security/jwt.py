from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt

from app.config import settings


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=settings.JWT_EXPIRATION_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS))
    to_encode.update({"exp": expire, "type": "refresh", "ver": to_encode.get("ver", 0)})
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def verify_refresh_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token, settings.JWT_REFRESH_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e


def decode_refresh_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token, settings.JWT_REFRESH_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e


def create_password_reset_token(user_id: str, email: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.PASSWORD_RESET_EXPIRATION_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "type": "password_reset",
    }
    return jwt.encode(payload, settings.PASSWORD_RESET_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_password_reset_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token, settings.PASSWORD_RESET_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "password_reset":
            return None
        return payload
    except JWTError:
        return None


def create_email_verification_token(user_id: str, email: str) -> str:
    expire = datetime.now(UTC) + timedelta(hours=24)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "type": "email_verification",
    }
    return jwt.encode(payload, settings.PASSWORD_RESET_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_email_verification_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token, settings.PASSWORD_RESET_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "email_verification":
            return None
        return payload
    except JWTError:
        return None
