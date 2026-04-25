from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://threatmap:threatmap@db:5432/threatmap"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://threatmap:threatmap@db:5432/threatmap"
    REDIS_URL: str = "redis://redis:6379/0"
    SECRET_KEY: str = "changeme-super-secret-key-at-least-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    CORS_ORIGINS: str = "http://localhost,http://localhost:3000,http://localhost:5173"
    ABUSEIPDB_API_KEY: Optional[str] = None
    VIRUSTOTAL_API_KEY: Optional[str] = None
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: str = "your-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_STORAGE_BUCKET: str = "threatmap"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = {"env_file": [".env", ".env.local"], "extra": "ignore"}


settings = Settings()
