from collections.abc import AsyncGenerator

import httpx
import ollama

from llm.base import LLMProvider


class OllamaProvider(LLMProvider):
    def __init__(self, host: str, model: str) -> None:
        self._client = ollama.AsyncClient(
            host=host,
            transport=httpx.AsyncHTTPTransport(),
        )
        self._model = model

    async def stream(
        self,
        messages: list[dict],
        system: str = "",
    ) -> AsyncGenerator[str, None]:
        ollama_messages = []
        if system:
            ollama_messages.append({"role": "system", "content": system})
        ollama_messages.extend(messages)

        async for part in await self._client.chat(
            model=self._model,
            messages=ollama_messages,
            stream=True,
        ):
            yield part.message.content
