from starlette.concurrency import run_in_threadpool

from app.core.config import RETRIEVAL_MIN_SCORE
from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService


class RetrievalService:
    def __init__(self, embedding_service=None, chroma_service=None):
        self.embedding_service = embedding_service or EmbeddingService()
        self.chroma_service = chroma_service or ChromaService()

    async def search(self, query: str, top_k: int = 5, min_score: float = RETRIEVAL_MIN_SCORE):
        if not query or not query.strip():
            raise ValueError("Query cannot be empty.")

        query_embeddings = await run_in_threadpool(
            self.embedding_service.generate_embeddings,
            [query.strip()],
        )

        if not query_embeddings:
            raise ValueError("Missing embeddings")

        chunks = await run_in_threadpool(
            self.chroma_service.search,
            query_embeddings[0],
            top_k,
        )

        if min_score > 0:
            chunks = [chunk for chunk in chunks if chunk.get("score", 0) >= min_score]

        return chunks