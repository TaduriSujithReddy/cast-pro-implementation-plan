import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Settings:
    """Plain config class — no pydantic-settings dependency, works on Python 3.9+."""

    DATABASE_URL: str = os.getenv(
        "POSTGRES_URL",
        os.getenv("DATABASE_URL", "postgresql://postgres:castpro123@localhost:5432/castpro"),
    )
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv(
        "SUPABASE_ANON_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    )
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "castpro-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS = [
        "http://localhost:3000",
        "https://*.vercel.app",
    ]


settings = Settings()
