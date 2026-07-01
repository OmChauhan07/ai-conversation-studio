from fastapi import APIRouter, File, UploadFile, HTTPException

from app.services.ingestion_service import IngestionService

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge"]
)


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