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

        try:
            # Validate query
            if not query or not query.strip():
                raise ValueError("Query cannot be empty.")

            query = query.strip()

            logger.info(
                "Starting retrieval for query: %s",
                query,
            )

            # Generate embedding
            query_embeddings = await run_in_threadpool(
                self.embedding_service.generate_embeddings,
                [query],
            )

            if query_embeddings is None:
                logger.error("Embedding generation returned None.")
                raise ValueError("Embedding generation failed.")

            if len(query_embeddings) == 0:
                logger.error("Embedding generation returned an empty list.")
                raise ValueError(
                    "Embedding generation returned an empty result."
                )

            logger.info("Query embedding generated successfully.")

            query_embedding = query_embeddings[0]

            # Search ChromaDB
            chunks = await run_in_threadpool(
                self.chroma_service.search,
                query_embedding,
                top_k,
            )

            if chunks is None:
                logger.warning("No chunks returned from ChromaDB.")
                raise NoRelevantKnowledgeError(
                    "No relevant knowledge found."
                )

            logger.info(
                "Retrieved %d candidate chunks from ChromaDB.",
                len(chunks),
            )

            filtered_chunks = []

            for chunk in chunks:
                score = chunk.get("score", 0)

                if score >= min_score:
                    filtered_chunks.append(chunk)

            logger.info(
                "%d chunks remained after similarity filtering.",
                len(filtered_chunks),
            )

            if len(filtered_chunks) == 0:
                logger.warning(
                    "No chunks met the similarity threshold (%.2f).",
                    min_score,
                )
                raise NoRelevantKnowledgeError(
                    "No relevant knowledge found."
                )

            logger.info("Retrieval completed successfully.")

            return filtered_chunks

        except Exception:
            logger.exception("Retrieval pipeline failed.")
            raise