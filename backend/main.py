from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import config
from llm import stream_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are a helpful customer support assistant.
Answer questions clearly and concisely based on the information provided to you.
If you don't know the answer, say so honestly."""


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


async def event_stream(messages: list[dict]) -> AsyncGenerator[str, None]:
    async for chunk in stream_response(messages, system=SYSTEM_PROMPT):
        yield f"data: {chunk}\n\n"
    yield "data: [DONE]\n\n"


@app.post("/chat")
async def chat(request: ChatRequest):
    messages = [m.model_dump() for m in request.messages]
    return StreamingResponse(
        event_stream(messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok", "provider": config.LLM_PROVIDER}
