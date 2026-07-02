from __future__ import annotations

import logging
import time

from app.core import config
from app.services.gemini_service import GeminiService
from app.services.prompt_service import PromptService
from app.services.retrieval_service import RetrievalService


logger = logging.getLogger(__name__)


class ChatService:
    """
    Orchestrates the complete RAG chat workflow.

    Flow:
        User Question
            ↓
        Retrieval Service
            ↓
        Prompt Service
            ↓
        Gemini Service
            ↓
        Return Response
    """

    def __init__(
        self,
        retrieval_service=None,
        prompt_service=None,
        gemini_service=None,
    ):
        self.retrieval_service = retrieval_service or RetrievalService()
        self.prompt_service = prompt_service or PromptService()
        self.gemini_service = gemini_service or GeminiService()

    async def chat(self, question: str):
        """Orchestrate retrieval, prompt building, and LLM generation."""

        if not question or not question.strip():
            raise ValueError("Message cannot be empty.")

        question = question.strip()
        logger.info("Question received: %s", question)

        retrieved_chunks = await self.retrieval_service.search(
            query=question,
            top_k=5,
            min_score=config.RETRIEVAL_MIN_SCORE,
        )

        logger.info("Chunks retrieved: %s", len(retrieved_chunks))

        prompt = self.prompt_service.build_prompt(
            question,
            retrieved_chunks,
        )

        logger.info("Prompt built")

        start_time = time.perf_counter()
        generation = await self.gemini_service.generate(prompt)
        logger.info("LLM latency: %.3fs", time.perf_counter() - start_time)
        logger.info("Provider selected: %s", generation.provider)

        sources = []
        seen = set()

        for chunk in retrieved_chunks:

            metadata = chunk.get("metadata", {})

            source = {
                "filename": metadata.get("original_name")
                or metadata.get("filename"),

                "chunk_number": metadata.get("chunk_number"),
            }

            key = (
                source["filename"],
                source["chunk_number"],
            )

            if key in seen:
                continue

            seen.add(key)
            sources.append(source)

        return {
            "answer": generation.text,
            "sources": sources,
            "metadata": {
                "provider": generation.provider,
                "model": generation.model,
                "chunks_used": len(retrieved_chunks),
            },
        }