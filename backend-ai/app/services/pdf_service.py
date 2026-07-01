from pypdf import PdfReader


class PDFService:

    @staticmethod
    def extract_text(pdf_path: str):

        reader = PdfReader(pdf_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return {
            "text": text.strip(),
            "pages": len(reader.pages)
        }