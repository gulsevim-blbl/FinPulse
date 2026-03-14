from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # .env'deki POSTGRES_* gibi ekstra değişkenleri yok say
    )

    database_url: str
    secret_key: str = "dev-secret-change-in-production"
    algorithm: str = "HS256"
    app_name: str = "FinPulse"
    app_version: str = "0.1.0"


settings = Settings()
