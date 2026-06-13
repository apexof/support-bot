from typing import AsyncGenerator
import anthropic
import httpx
import ollama

from config import config


async def stream_response(
    messages: list[dict],
    system: str = "",
) -> AsyncGenerator[str, None]:
    """Unified streaming interface for all LLM providers.

    Yields text chunks as they arrive from the model.
    Provider is selected by LLM_PROVIDER env var.
    """
    if config.LLM_PROVIDER == "claude":
        async for chunk in _stream_claude(messages, system):
            yield chunk
    else:
        async for chunk in _stream_ollama(messages, system):
            yield chunk


async def _stream_claude(
    messages: list[dict],
    system: str,
) -> AsyncGenerator[str, None]:
    client = anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)

    async with client.messages.stream(
        model=config.CLAUDE_MODEL,
        max_tokens=1024,
        system=system,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def _stream_ollama(
    messages: list[dict],
    system: str,
) -> AsyncGenerator[str, None]:
    client = ollama.AsyncClient(
        host=config.OLLAMA_HOST,
        transport=httpx.AsyncHTTPTransport(),
    )

    ollama_messages = []
    if system:
        ollama_messages.append({"role": "system", "content": system})
    ollama_messages.extend(messages)

    async for part in await client.chat(
        model=config.OLLAMA_MODEL,
        messages=ollama_messages,
        stream=True,
    ):
        yield part.message.content
