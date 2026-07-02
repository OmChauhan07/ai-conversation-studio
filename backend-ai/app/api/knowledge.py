from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid

from app.services.ingestion_service import IngestionService
from app.services.knowledge_service import KnowledgeService
from app.core.exceptions import (
    KnowledgeBaseEmptyError,
    DocumentNotFoundError,
)
from app.core.database import get_db
from app.api.dependencies import get_current_user_id
from app.models import UploadedDocument, DocumentStatus

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge"]
)

knowledge_service = KnowledgeService()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):

    try:
        result = await IngestionService.process_document(file)

        doc_meta = result["document"]
        stats = result["statistics"]

        # Save to PostgreSQL Database
        new_doc = UploadedDocument(
            id=str(uuid.uuid4()),
            userId=user_id,
            filename=doc_meta["filename"],
            originalName=doc_meta["original_name"],
            fileSize=doc_meta["size"],
            pages=stats["pages"],
            chunks=stats["chunks"],
            status=DocumentStatus.PROCESSED
        )
        db.add(new_doc)
        db.commit()

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
async def list_documents(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        # Fetch from PostgreSQL directly per user
        docs = db.query(UploadedDocument).filter(UploadedDocument.userId == user_id).all()

        doc_list = [{
            "filename": d.filename,
            "original_name": d.originalName,
            "uploaded_at": d.uploadedAt.isoformat() if d.uploadedAt else None,
            "chunks": d.chunks,
            "size": d.fileSize,
            "status": d.status.value if d.status else None
        } for d in docs]

        if not doc_list:
            raise KnowledgeBaseEmptyError("No documents found for this user.")

        return {
            "success": True,
            "count": len(doc_list),
            "documents": doc_list,
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
async def delete_document(
    filename: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        # Verify ownership in PostgreSQL before deleting
        doc = db.query(UploadedDocument).filter_by(filename=filename, userId=user_id).first()
        if not doc:
            raise DocumentNotFoundError("Document not found or you are not authorized to delete it.")

        # Delete from ChromaDB and File System
        result = knowledge_service.delete_document(filename)

        # Delete from PostgreSQL Database
        db.delete(doc)
        db.commit()

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