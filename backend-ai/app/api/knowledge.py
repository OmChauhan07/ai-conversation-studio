from fastapi import APIRouter, File, UploadFile, HTTPException

from app.services.ingestion_service import IngestionService
from app.services.knowledge_service import KnowledgeService
from app.core.exceptions import (
    KnowledgeBaseEmptyError,
    DocumentNotFoundError,
)

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge"]
)

knowledge_service = KnowledgeService()


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    try:

        result = await IngestionService.process_document(file)

        return {
            "success": True,
            **result
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.get("/documents")
async def list_documents():
    try:
        documents = knowledge_service.list_documents()

        return {
            "success": True,
            "count": len(documents),
            "documents": documents,
        }

    except KnowledgeBaseEmptyError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.delete("/{filename}")
async def delete_document(filename: str):
    try:
        result = knowledge_service.delete_document(filename)

        return result

    except DocumentNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )