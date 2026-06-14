from collections.abc import AsyncGenerator

import ollama

from llm.base import LLMProvider


class OllamaProvider(LLMProvider):
    def __init__(self, client: ollama.AsyncClient, model: str) -> None:
        self._client = client
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
            content = part.message.content
            if content is not None:
                yield content
