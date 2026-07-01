from langchain_text_splitters import RecursiveCharacterTextSplitter

class ChunkService:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=[
            "\n\n",
            "\n",
            ". ",
            " ",
            ""
        ]
    )

    @classmethod
    def split_text(cls, text: str):

        return cls.splitter.split_text(text)