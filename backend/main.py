from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from chat.router import router as chat_router
from config import config
from knowledge_base.router import router as knowledge_base_router
from limiter import limiter


async def rate_limit_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc}"},
    )


app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)  # type: ignore[arg-type]

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(knowledge_base_router)


class HealthResponse(BaseModel):
    status: str
    provider: str


@app.get("/health")
async def health() -> HealthResponse:
    return HealthResponse(status="ok", provider=config.LLM_PROVIDER)
