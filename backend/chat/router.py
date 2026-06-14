import json
from collections.abc import AsyncGenerator
from typing import Literal

import anthropic
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from chat.schemas import ChatRequest
from chat.service import stream_chat
from limiter import limiter

router = APIRouter()


def _extract_error_message(e: Exception) -> str:
    if isinstance(e, anthropic.APIStatusError) and isinstance(e.body, dict):
        error = e.body.get("error", {})
        if isinstance(error, dict) and "message" in error:
            return error["message"]
    return str(e)


async def _event_stream(
    messages: list[dict],
    provider: Literal["ollama", "claude"] | None,
    request: Request,
) -> AsyncGenerator[str, None]:
    try:
        async for chunk in stream_chat(
            messages, request=request, provider_name=provider
        ):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'message': _extract_error_message(e)})}\n\n"


@router.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest) -> StreamingResponse:
    messages = [m.model_dump() for m in body.messages]
    return StreamingResponse(
        _event_stream(messages, body.provider, request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
