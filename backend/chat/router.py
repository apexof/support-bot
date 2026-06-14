from collections.abc import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from chat.schemas import ChatRequest
from chat.service import stream_chat

router = APIRouter()


async def _event_stream(messages: list[dict], provider: str | None) -> AsyncGenerator[str, None]:
    async for chunk in stream_chat(messages, provider_name=provider):
        yield f"data: {chunk}\n\n"
    yield "data: [DONE]\n\n"


@router.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    messages = [m.model_dump() for m in request.messages]
    return StreamingResponse(
        _event_stream(messages, request.provider),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
