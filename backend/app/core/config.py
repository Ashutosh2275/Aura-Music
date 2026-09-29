from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Aura Music API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security & Auth
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379/0"

    # Music Provider APIs (Permitted / Creative Commons / Open Access)
    JAMENDO_CLIENT_ID: Optional[str] = None

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="allow")


settings = Settings()
