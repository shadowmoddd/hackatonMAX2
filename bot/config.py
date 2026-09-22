from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    BOT_TOKEN: str
    GROQ_API_KEY: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/bot.db"
    DEBUG: bool = False
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    MAX_TOKENS: int = 3500
    MINIAPP_URL: str = ""
    # Public MAX bot username or MAX bot link used by the open_app button.
    MAX_BOT_USERNAME: str = ""
    RESOURCES_DB_PATH: str = "data/resources.json"
    MAX_WEBHOOK_URL: str = ""
    MAX_WEBHOOK_SECRET: str = ""
    MAX_API_BASE: str = "https://platform-api2.max.ru"


settings = Settings()
