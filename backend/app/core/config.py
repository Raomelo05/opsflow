"""
Configurações da aplicação, lidas de variáveis de ambiente.
Em desenvolvimento, os valores default abaixo batem com o docker-compose.yml.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "OpsFlow API"
    environment: str = "development"

    database_url: str = "postgresql+psycopg2://opsflow:opsflow@db:5432/opsflow"

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 8  # 8 horas

    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
