from __future__ import annotations

import logging
from pathlib import Path

from app.core.config import UPLOAD_DIR
from app.core.exceptions import (
    DocumentNotFoundError,
    KnowledgeBaseEmptyError,
)
from app.services.chroma_service import ChromaService


logger = logging.getLogger(__name__)


class KnowledgeService:
    """
    Handles knowledge base management.

    Responsibilities:
    - List uploaded documents
    - Delete uploaded documents
    """

    def __init__(self):
        self.chroma_service = ChromaService()

    def list_documents(self):
        """
        Return all indexed documents.
        """

        try:
            logger.info("Fetching indexed documents.")

            collection = self.chroma_service.collection

            total_documents = collection.count()

            logger.info(
                "Knowledge base currently contains %d chunks.",
                total_documents,
            )

            if total_documents == 0:
                logger.warning("Knowledge base is empty.")
                raise KnowledgeBaseEmptyError(
                    "Knowledge base is empty."
                )

            result = collection.get(
                include=["metadatas"]
            )

            ids = result.get("ids") or []
            metadatas = result.get("metadatas") or []

            documents = {}

            for index in range(len(ids)):

                metadata = metadatas[index] or {}

                filename = metadata.get("filename")

                if not filename:
                    continue

                if filename in documents:
                    continue

                file_path = Path(UPLOAD_DIR) / filename

                documents[filename] = {
                    "filename": filename,
                    "original_name": metadata.get("original_name"),
                    "uploaded_at": metadata.get("uploaded_at"),
                    "chunks": metadata.get("total_chunks"),
                    "size": (
                        file_path.stat().st_size
                        if file_path.exists()
                        else 0
                    ),
                    "exists": file_path.exists(),
                }

            logger.info(
                "Returned %d documents.",
                len(documents),
            )

            return list(documents.values())

        except Exception:
            logger.exception(
                "Failed to list knowledge documents."
            )
            raise

    def delete_document(self, filename: str):
        """
        Delete a document from both
        ChromaDB and uploads/.
        """

        try:
            logger.info(
                "Deleting document: %s",
                filename,
            )

            collection = self.chroma_service.collection

            result = collection.get(
                where={
                    "filename": filename
                }
            )

            ids = result.get("ids") or []

            if len(ids) == 0:
                logger.warning(
                    "Document not found: %s",
                    filename,
                )

                raise DocumentNotFoundError(
                    "Document not found."
                )

            collection.delete(
                where={
                    "filename": filename
                }
            )

            logger.info(
                "Removed embeddings from ChromaDB."
            )

            file_path = Path(UPLOAD_DIR) / filename

            if file_path.exists():
                file_path.unlink()

                logger.info(
                    "Deleted uploaded file."
                )

            logger.info(
                "Document deleted successfully."
            )

            return {
                "success": True,
                "message": "Document deleted successfully.",
                "filename": filename,
            }

        except Exception:
            logger.exception(
                "Failed to delete document."
            )
            raise