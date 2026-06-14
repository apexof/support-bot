from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from chat.router import router as chat_router
from config import config

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(chat_router)


class HealthResponse(BaseModel):
    status: str
    provider: str


@app.get("/health")
async def health() -> HealthResponse:
    return HealthResponse(status="ok", provider=config.LLM_PROVIDER)
