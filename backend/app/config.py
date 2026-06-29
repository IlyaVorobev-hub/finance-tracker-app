import secrets

from pydantic_settings import BaseSettings


def _generate_secret() -> str:
    return secrets.token_hex(32)


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "extra": "ignore"}

    APP_NAME: str = "Finance Tutor API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/finance_tutor"
    JWT_SECRET_KEY: str = _generate_secret()
    JWT_REFRESH_SECRET_KEY: str = _generate_secret()
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 15
    JWT_REFRESH_EXPIRATION_DAYS: int = 7
    PASSWORD_RESET_SECRET: str = _generate_secret()
    PASSWORD_RESET_EXPIRATION_MINUTES: int = 30

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@finance-tutor.app"

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    RATE_LIMIT: str = "60/minute"


settings = Settings()
