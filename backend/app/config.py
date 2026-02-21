import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase PostgreSQL connection (from Vercel integration env vars)
    DATABASE_URL: str = os.getenv(
        "POSTGRES_URL",
        os.getenv("DATABASE_URL", "postgresql://postgres:castpro123@localhost:5432/castpro"),
    )
    # Supabase keys (for admin operations like creating biller users)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "castpro-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://*.vercel.app",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
