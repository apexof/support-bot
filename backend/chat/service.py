from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Literal

from fastapi import Request

from llm.factory import get_provider

_SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "system.txt").read_text()


def _build_system_prompt(kb_text: str) -> str:
    return f"{_SYSTEM_PROMPT}\n\n<knowledge_base>\n{kb_text}\n</knowledge_base>"


_NO_KB_MESSAGE = (
    "Привет! Я бот поддержки на основе базы знаний. "
    "Чтобы я мог помочь, загрузи, пожалуйста, файл с базой знаний — "
    "после этого я буду готов отвечать на твои вопросы.\n\n"
    "Хочешь просто потестировать? Загрузи любой текстовый файл (.txt или .md) "
    "с произвольным содержимым."
)


async def stream_chat(
    messages: list[dict],
    request: Request,
    provider_name: Literal["ollama", "claude"] | None = None,
) -> AsyncGenerator[str, None]:
    kb = getattr(request.app.state, "knowledge_base", None)
    if kb is None:
        yield _NO_KB_MESSAGE
        return

    provider = get_provider(provider_name)
    system = _build_system_prompt(kb["text"])
    async for chunk in provider.stream(messages, system=system):
        yield chunk
