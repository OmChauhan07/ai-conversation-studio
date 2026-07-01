from fastapi import APIRouter
from fastapi import File
from fastapi import UploadFile
from fastapi import HTTPException

from app.services.file_service import FileService

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge"]
)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    try:

        document = await FileService.save_pdf(file)

        return {
            "success": True,
            "document": document
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Failed to upload document."
        )