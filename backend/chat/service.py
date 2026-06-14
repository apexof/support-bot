from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Literal

from fastapi import Request

from llm.factory import get_provider

_SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "system.txt").read_text()


def _build_system_prompt(request: Request) -> str:
    kb = getattr(request.app.state, "knowledge_base", None)
    if kb is None:
        return _SYSTEM_PROMPT
    return f"{_SYSTEM_PROMPT}\n\n<knowledge_base>\n{kb['text']}\n</knowledge_base>"


async def stream_chat(
    messages: list[dict],
    request: Request,
    provider_name: Literal["ollama", "claude"] | None = None,
) -> AsyncGenerator[str, None]:
    provider = get_provider(provider_name)
    system = _build_system_prompt(request)
    async for chunk in provider.stream(messages, system=system):
        yield chunk
