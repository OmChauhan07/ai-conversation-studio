from __future__ import annotations

from app.core.config import RETRIEVAL_MIN_SCORE
from app.services.gemini_service import GeminiService
from app.services.prompt_service import PromptService
from app.services.retrieval_service import RetrievalService


class ChatService:
    def __init__(self, retrieval_service=None, prompt_service=None, gemini_service=None):
        self.retrieval_service = retrieval_service or RetrievalService()
        self.prompt_service = prompt_service or PromptService()
        self.gemini_service = gemini_service or GeminiService()

    async def chat(self, question: str):
        if not question or not question.strip():
            raise ValueError("Message cannot be empty.")

        retrieved_chunks = await self.retrieval_service.search(
            question,
            top_k=5,
            min_score=RETRIEVAL_MIN_SCORE,
        )

        if not retrieved_chunks:
            raise LookupError("No relevant knowledge found.")

        prompt = self.prompt_service.build_prompt(question, retrieved_chunks)
        generation = await self.gemini_service.generate(prompt)

        sources = []
        seen_sources = set()
        for chunk in retrieved_chunks:
            metadata = chunk.get("metadata") or {}
            source = {
                "filename": metadata.get("original_name") or metadata.get("filename"),
                "chunk_number": metadata.get("chunk_number"),
            }
            dedupe_key = (source["filename"], source["chunk_number"])
            if dedupe_key in seen_sources:
                continue
            seen_sources.add(dedupe_key)
            sources.append(source)

        return {
            "answer": generation.text,
            "sources": sources,
            "metadata": {
                "chunks_used": len(retrieved_chunks),
                "model": generation.model,
                "provider": generation.provider,
            },
        }