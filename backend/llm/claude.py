from collections.abc import AsyncGenerator

import anthropic

from llm.base import LLMProvider


class ClaudeProvider(LLMProvider):
    def __init__(self, client: anthropic.AsyncAnthropic, model: str) -> None:
        self._client = client
        self._model = model

    async def stream(
        self,
        messages: list[dict],
        system: str = "",
    ) -> AsyncGenerator[str, None]:
        async with self._client.messages.stream(
            model=self._model,
            max_tokens=512,
            system=system,
            messages=messages,
        ) as s:
            async for text in s.text_stream:
                yield text
