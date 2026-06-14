import os
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_env = os.getenv("APP_ENV", "development")

# Files are merged in order — later files override earlier ones.
# .env.local is never committed and holds secrets (ANTHROPIC_API_KEY).
_env_files = (f".env.{_env}", ".env.local")


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_files,
        env_file_encoding="utf-8",
    )

    LLM_PROVIDER: Literal["ollama", "claude"] = "ollama"

    OLLAMA_MODEL: str = "llama3.2"
    OLLAMA_HOST: str = "http://localhost:11434"

    ANTHROPIC_API_KEY: str | None = None
    CLAUDE_MODEL: str = "claude-haiku-4-5"

    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    @model_validator(mode="after")
    def validate_api_key(self) -> "Config":
        if self.LLM_PROVIDER == "claude" and not self.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is required when LLM_PROVIDER=claude")
        return self


config = Config()
