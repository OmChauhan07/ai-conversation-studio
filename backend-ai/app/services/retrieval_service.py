from __future__ import annotations

import logging

from starlette.concurrency import run_in_threadpool

from app.core import config
from app.core.exceptions import NoRelevantKnowledgeError
from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService


logger = logging.getLogger(__name__)


class RetrievalService:
    def __init__(self, embedding_service=None, chroma_service=None):
        self.embedding_service = embedding_service or EmbeddingService()
        self.chroma_service = chroma_service or ChromaService()

    async def search(
        self,
        query: str,
        top_k: int = 5,
        min_score: float = config.RETRIEVAL_MIN_SCORE,
    ):
        """
        Search the vector database for the most relevant chunks.
        """

        # Validate query
        if not query or not query.strip():
            raise ValueError("Query cannot be empty.")

        # Generate embedding
        query_embeddings = await run_in_threadpool(
            self.embedding_service.generate_embeddings,
            [query.strip()],
        )

        # Safely validate embeddings
        if query_embeddings is None:
            raise ValueError("Embedding generation failed.")

        if len(query_embeddings) == 0:
            raise ValueError("Embedding generation returned an empty result.")

        # Use the first embedding (single query)
        query_embedding = query_embeddings[0]

        # Search ChromaDB
        chunks = await run_in_threadpool(self.chroma_service.search, query_embedding, top_k)

        # Ensure chunks is always a list
        if chunks is None:
            raise NoRelevantKnowledgeError("No relevant knowledge found.")

        # Filter by similarity threshold
        filtered_chunks = []

        for chunk in chunks:
            score = chunk.get("score", 0)

            if score >= min_score:
                filtered_chunks.append(chunk)

        logger.info("Chunks retrieved: %s", len(filtered_chunks))

        if len(filtered_chunks) == 0:
            raise NoRelevantKnowledgeError("No relevant knowledge found.")

        return filtered_chunks