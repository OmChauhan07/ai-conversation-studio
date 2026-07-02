from __future__ import annotations

import logging
from collections.abc import Iterable
from typing import Any


logger = logging.getLogger(__name__)


class PromptService:
    MAX_CONTEXT_CHARS = 8000

    SYSTEM_PROMPT = (
        "You are an enterprise AI assistant.\n\n"
        "Answer ONLY using the supplied context.\n\n"
        "If the answer is not present inside the context,\n"
        "respond exactly:\n\n"
        '"I couldn\'t find that information in the uploaded knowledge base."\n\n'
        "Do not hallucinate.\n"
        "Do not invent facts.\n\n"
        "Context:\n\n"
    )

    @staticmethod
    def _normalize_chunks(retrieved_chunks: Iterable[dict[str, Any]]) -> list[str]:
        """Deduplicate retrieved chunks while preserving order."""

        normalized = []
        seen = set()

        for chunk in retrieved_chunks:
            if not isinstance(chunk, dict):
                continue

            chunk_text = chunk.get("chunk") or chunk.get("document") or ""
            chunk_text = str(chunk_text).strip()
            if not chunk_text or chunk_text in seen:
                continue

            seen.add(chunk_text)
            normalized.append(chunk_text)

        return normalized

    def build_prompt(self, question: str, retrieved_chunks: Iterable[dict[str, Any]]) -> str:
        """Build a single grounded prompt from the question and retrieved chunks."""

        chunks = self._normalize_chunks(retrieved_chunks)
        separator = "\n\n---\n\n"

        context_parts = []
        context_length = 0

        for chunk in chunks:
            separator_length = len(separator) if context_parts else 0
            projected_length = context_length + separator_length + len(chunk)

            if projected_length > self.MAX_CONTEXT_CHARS:
                break

            context_parts.append(chunk)
            context_length = projected_length

        context = separator.join(context_parts) if context_parts else "No relevant context was retrieved."

        logger.info("Prompt built with %s chunk(s)", len(context_parts))

        return (
            f"{self.SYSTEM_PROMPT}"
            f"{context}\n\n"
            f"Question:\n\n{question.strip()}\n\n"
            "Provide a concise and professional answer."
        )