from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import UPLOAD_DIR


class FileService:

    @staticmethod
    async def save_pdf(file: UploadFile):

        # Only allow PDFs
        if file.content_type != "application/pdf":
            raise ValueError("Only PDF files are allowed.")

        upload_path = Path(UPLOAD_DIR)
        upload_path.mkdir(parents=True, exist_ok=True)

        unique_filename = f"{uuid4()}_{file.filename}"

        file_path = upload_path / unique_filename

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        return {
            "filename": unique_filename,
            "original_name": file.filename,
            "path": str(file_path),
            "content_type": file.content_type,
            "size": file_path.stat().st_size,
        }