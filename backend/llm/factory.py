from typing import Literal

import anthropic

from config import config
from llm.base import LLMProvider
from llm.claude import ClaudeProvider
from llm.ollama import OllamaProvider

# Expensive HTTP clients are singletons — created once, reused across requests.
_anthropic_client = anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)


def get_provider(name: Literal["ollama", "claude"] | None = None) -> LLMProvider:
    provider_name = name or config.LLM_PROVIDER

    if provider_name == "claude":
        return ClaudeProvider(client=_anthropic_client, model=config.CLAUDE_MODEL)

    return OllamaProvider(host=config.OLLAMA_HOST, model=config.OLLAMA_MODEL)
