from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import UploadFile
from starlette.concurrency import run_in_threadpool

from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService
from app.services.chunk_service import ChunkService
from app.services.file_service import FileService
from app.services.pdf_service import PDFService


logger = logging.getLogger(__name__)


class IngestionService:
    chroma_service = ChromaService()

    @staticmethod
    async def process_document(file: UploadFile):
        """
        Upload, process, chunk, embed, and index a PDF document.
        """

        try:
            logger.info(
                "Starting document ingestion: %s",
                file.filename,
            )

            # Step 1 - Save file
            document = await FileService.save_pdf(file)

            logger.info(
                "Document saved successfully: %s",
                document["filename"],
            )

            # Step 2 - Extract text
            pdf = PDFService.extract_text(document["path"])

            logger.info(
                "PDF processed successfully. Pages: %d",
                pdf["pages"],
            )

            # Step 3 - Chunk text
            chunks = ChunkService.split_text(pdf["text"])

            logger.info(
                "Generated %d text chunks.",
                len(chunks),
            )

            if chunks:

                # Step 4 - Generate embeddings
                embeddings = await run_in_threadpool(
                    EmbeddingService.generate_embeddings,
                    chunks,
                )

                logger.info(
                    "Generated %d embeddings.",
                    len(embeddings),
                )

                if len(embeddings) != len(chunks):
                    logger.error(
                        "Embedding count (%d) does not match chunk count (%d).",
                        len(embeddings),
                        len(chunks),
                    )
                    raise ValueError("Missing embeddings")

                uploaded_at = (
                    datetime.now(timezone.utc)
                    .isoformat()
                    .replace("+00:00", "Z")
                )

                metadatas = [
                    {
                        "filename": document["filename"],
                        "original_name": document["original_name"],
                        "chunk_number": index + 1,
                        "total_chunks": len(chunks),
                        "uploaded_at": uploaded_at,
                    }
                    for index in range(len(chunks))
                ]

                ids = [
                    f'{document["filename"]}_chunk_{index + 1}'
                    for index in range(len(chunks))
                ]

                # Step 5 - Store in ChromaDB
                await run_in_threadpool(
                    IngestionService.chroma_service.add_documents,
                    ids,
                    chunks,
                    metadatas,
                    embeddings,
                )

                logger.info(
                    "Indexed %d chunks into ChromaDB.",
                    len(chunks),
                )

            logger.info(
                "Document ingestion completed successfully."
            )

            return {
                "message": "Document uploaded and processed successfully.",
                "document": document,
                "statistics": {
                    "pages": pdf["pages"],
                    "characters": len(pdf["text"]),
                    "chunks": len(chunks),
                },
                "preview": chunks[0] if chunks else "",
                "chunks": chunks,
            }

        except Exception:
            logger.exception(
                "Document ingestion failed."
            )
            raise