from __future__ import annotations

from collections.abc import Iterable


class PromptService:
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
    def _normalize_chunks(retrieved_chunks: Iterable[dict]) -> list[str]:
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

    def build_prompt(self, question: str, retrieved_chunks: Iterable[dict]) -> str:
        chunks = self._normalize_chunks(retrieved_chunks)
        context = "\n\n---\n\n".join(chunks) if chunks else "No relevant context was retrieved."

        return (
            f"{self.SYSTEM_PROMPT}"
            f"{context}\n\n"
            f"Question:\n\n{question.strip()}\n\n"
            "Provide a concise and professional answer."
        )