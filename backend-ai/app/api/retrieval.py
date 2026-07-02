from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.services.retrieval_service import RetrievalService

router = APIRouter(
    prefix="/retrieval",
    tags=["Retrieval"],
)


class RetrievalRequest(BaseModel):
    query: str = Field(..., min_length=1)


@router.post("/search")
async def search(request: RetrievalRequest):
    try:
        retrieval_service = RetrievalService()
        chunks = await retrieval_service.search(request.query)

        return {"chunks": chunks}
    except ValueError as error:
        return {"success": False, "message": str(error)}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))