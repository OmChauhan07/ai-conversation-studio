from fastapi import UploadFile

from app.services.file_service import FileService
from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService


class IngestionService:

    @staticmethod
    async def process_document(file: UploadFile):

        # Step 1
        document = await FileService.save_pdf(file)

        # Step 2
        pdf = PDFService.extract_text(document["path"])

        # Step 3
        chunks = ChunkService.split_text(pdf["text"])

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