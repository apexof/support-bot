from functools import lru_cache
from typing import Literal

import anthropic
import httpx
import ollama

from config import config
from llm.base import LLMProvider
from llm.claude import ClaudeProvider
from llm.ollama import OllamaProvider


@lru_cache(maxsize=1)
def _get_anthropic_client() -> anthropic.AsyncAnthropic:
    if not config.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not set")
    return anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)


@lru_cache(maxsize=1)
def _get_ollama_client() -> ollama.AsyncClient:
    return ollama.AsyncClient(
        host=config.OLLAMA_HOST,
        transport=httpx.AsyncHTTPTransport(),
    )


def get_provider(name: Literal["ollama", "claude"] | None = None) -> LLMProvider:
    provider_name = name or config.LLM_PROVIDER

    if provider_name == "claude":
        return ClaudeProvider(client=_get_anthropic_client(), model=config.CLAUDE_MODEL)

    return OllamaProvider(client=_get_ollama_client(), model=config.OLLAMA_MODEL)
