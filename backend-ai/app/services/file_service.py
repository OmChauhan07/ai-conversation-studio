from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import UPLOAD_DIR


class FileService:

    @staticmethod
    async def save_pdf(file: UploadFile):

        if file is None:
            raise ValueError("No file provided.")

        if file.content_type != "application/pdf":
            raise ValueError("Only PDF files are allowed.")

        upload_path = Path(UPLOAD_DIR)
        upload_path.mkdir(parents=True, exist_ok=True)

        safe_filename = Path(file.filename or "document.pdf").name
        unique_filename = f"{uuid4()}_{safe_filename}"

        file_path = upload_path / unique_filename

        file_size = 0

        with open(file_path, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)  # 1 MB
                if not chunk:
                    break

                buffer.write(chunk)
                file_size += len(chunk)

        if file_size == 0:
            file_path.unlink(missing_ok=True)
            raise ValueError("Uploaded file is empty.")

        return {
            "filename": unique_filename,
            "original_name": safe_filename,
            "path": str(file_path.resolve()),
            "content_type": file.content_type,
            "size": file_size,
        }