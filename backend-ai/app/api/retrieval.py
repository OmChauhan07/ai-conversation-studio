from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.core.exceptions import KnowledgeBaseEmptyError, NoRelevantKnowledgeError
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
    except KnowledgeBaseEmptyError as error:
        return JSONResponse(status_code=404, content={"success": False, "message": str(error)})
    except NoRelevantKnowledgeError as error:
        return JSONResponse(status_code=404, content={"success": False, "message": str(error)})
    except ValueError as error:
        return JSONResponse(status_code=400, content={"success": False, "message": str(error)})
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))