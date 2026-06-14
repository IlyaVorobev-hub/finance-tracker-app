from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "extra": "ignore"}

    APP_NAME: str = "Finance Tutor API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/finance_tutor"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 15
    JWT_REFRESH_EXPIRATION_DAYS: int = 7

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    RATE_LIMIT: str = "60/minute"


settings = Settings()
