from collections.abc import AsyncGenerator
from pathlib import Path

from llm.factory import get_provider

_SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "system.txt").read_text()


async def stream_chat(
    messages: list[dict],
    provider_name: str | None = None,
) -> AsyncGenerator[str, None]:
    provider = get_provider(provider_name)
    async for chunk in provider.stream(messages, system=_SYSTEM_PROMPT):
        yield chunk
