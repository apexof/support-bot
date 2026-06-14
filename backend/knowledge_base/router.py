from fastapi import APIRouter, Request, UploadFile
from pydantic import BaseModel

from limiter import limiter

router = APIRouter()

MAX_FILE_SIZE = 100 * 1024  # 100 KB


class UploadResponse(BaseModel):
    filename: str
    size: int


class StatusResponse(BaseModel):
    filename: str | None
    size: int | None


@router.post("/knowledge-base", response_model=UploadResponse)
@limiter.limit("5/minute")
async def upload_knowledge_base(request: Request, file: UploadFile) -> UploadResponse:
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=413, detail="File too large. Maximum size is 100 KB."
        )

    text = content.decode("utf-8")
    request.app.state.knowledge_base = {
        "text": text,
        "filename": file.filename,
        "size": len(content),
    }
    return UploadResponse(filename=file.filename or "", size=len(content))


@router.get("/knowledge-base", response_model=StatusResponse)
async def get_knowledge_base_status(request: Request) -> StatusResponse:
    kb = getattr(request.app.state, "knowledge_base", None)
    if kb is None:
        return StatusResponse(filename=None, size=None)
    return StatusResponse(filename=kb["filename"], size=kb["size"])


@router.delete("/knowledge-base")
async def delete_knowledge_base(request: Request) -> dict:
    request.app.state.knowledge_base = None
    return {"ok": True}
