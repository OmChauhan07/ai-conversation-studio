from datetime import datetime, timezone

from fastapi import UploadFile
from starlette.concurrency import run_in_threadpool

from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService
from app.services.chunk_service import ChunkService
from app.services.file_service import FileService
from app.services.pdf_service import PDFService


class IngestionService:
    chroma_service = ChromaService()

    @staticmethod
    async def process_document(file: UploadFile):
        # Step 1
        document = await FileService.save_pdf(file)

        # Step 2
        pdf = PDFService.extract_text(document["path"])

        # Step 3
        chunks = ChunkService.split_text(pdf["text"])

        if chunks:
            embeddings = await run_in_threadpool(EmbeddingService.generate_embeddings, chunks)

            if len(embeddings) != len(chunks):
                raise ValueError("Missing embeddings")

            uploaded_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
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
            ids = [f'{document["filename"]}_chunk_{index + 1}' for index in range(len(chunks))]

            await run_in_threadpool(
                IngestionService.chroma_service.add_documents,
                ids,
                chunks,
                metadatas,
                embeddings,
            )

        return {
            "message": "Document uploaded and processed successfully.",
            "document": document,
            "statistics": {
                "pages": pdf["pages"],
                "characters": len(pdf["text"]),
                "chunks": len(chunks)
            },
            "preview": chunks[0] if chunks else "",
            "chunks": chunks
        }