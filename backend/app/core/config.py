from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = Field(validation_alias="CATERING_DATABASE_URL")
    APP_HOST: str = Field(default="0.0.0.0", validation_alias="CATERING_APP_HOST")
    APP_PORT: int = Field(default=8000, validation_alias="CATERING_APP_PORT")
    DEBUG: bool = Field(default=True, validation_alias="CATERING_DEBUG")
    CORS_ORIGINS: str = Field(default="*", validation_alias="CATERING_CORS_ORIGINS")
    CORS_ALLOW_CREDENTIALS: bool = Field(default=False, validation_alias="CATERING_CORS_ALLOW_CREDENTIALS")
    HEALTHCHECK_DB: bool = Field(default=True, validation_alias="CATERING_HEALTHCHECK_DB")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        url = (value or "").strip()
        if not url:
            raise ValueError("DATABASE_URL is required")

        # Render (and some providers) use "postgres://" / "postgresql://" URLs.
        # SQLAlchemy async engine expects "postgresql+asyncpg://".
        if url.startswith("postgres://"):
            return "postgresql+asyncpg://" + url[len("postgres://") :]
        if url.startswith("postgresql://") and not url.startswith("postgresql+"):
            return "postgresql+asyncpg://" + url[len("postgresql://") :]
        return url


settings = Settings()
