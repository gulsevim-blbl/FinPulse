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

    # SMTP Settings
    smtp_tls: bool = True
    smtp_ssl: bool = False
    smtp_port: int = 587
    smtp_host: str = ""
    smtp_user: str = ""
    smtp_password: str = ""
    emails_from_email: str = ""
    emails_from_name: str = "FinPulse"


settings = Settings()
