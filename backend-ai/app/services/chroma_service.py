from __future__ import annotations

import math
from typing import Any

from app.vector_store.chroma_client import get_collection


class ChromaService:
    def __init__(self, collection=None):
        try:
            self.collection = collection or get_collection()
        except Exception:
            self.collection = None

    def _require_collection(self):
        if self.collection is None:
            raise ValueError("Invalid collection")

        return self.collection

    @staticmethod
    def _cosine_similarity(left: list[float], right: list[float]) -> float:
        if not left or not right or len(left) != len(right):
            return -1.0

        dot_product = sum(l * r for l, r in zip(left, right))
        left_norm = math.sqrt(sum(value * value for value in left))
        right_norm = math.sqrt(sum(value * value for value in right))

        if left_norm == 0 or right_norm == 0:
            return -1.0

        return dot_product / (left_norm * right_norm)

    def add_documents(
        self,
        ids: list[str],
        documents: list[str],
        metadatas: list[dict[str, Any]],
        embeddings: list[list[float]],
    ) -> dict[str, Any]:
        collection = self._require_collection()

        if not documents:
            return {"added": 0}

        if not embeddings or len(embeddings) != len(documents):
            raise ValueError("Missing embeddings")

        try:
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings,
            )
        except Exception as error:
            raise ValueError("Invalid collection") from error

        return {"added": len(documents)}

    def search(self, query_embedding: list[float], top_k: int = 5) -> list[dict[str, Any]]:
        collection = self._require_collection()

        try:
            total_vectors = collection.count()
        except Exception as error:
            raise ValueError("Invalid collection") from error
        if total_vectors == 0:
            raise ValueError("Empty database")

        try:
            records = collection.get(include=["documents", "embeddings", "metadatas"])
        except Exception as error:
            raise ValueError("Invalid collection") from error
        ids = records.get("ids") or []
        documents = records.get("documents") or []
        metadatas = records.get("metadatas") or []
        embeddings = records.get("embeddings") or []

        if not embeddings:
            raise ValueError("Missing embeddings")

        results = []

        for index, document_embedding in enumerate(embeddings):
            if document_embedding is None:
                raise ValueError("Missing embeddings")

            score = self._cosine_similarity(query_embedding, document_embedding)
            results.append(
                {
                    "id": ids[index] if index < len(ids) else None,
                    "chunk": documents[index] if index < len(documents) else "",
                    "metadata": metadatas[index] if index < len(metadatas) else {},
                    "score": score,
                }
            )

        results.sort(key=lambda item: item["score"], reverse=True)
        return results[:top_k]

    def delete_document(self, filename: str) -> dict[str, Any]:
        collection = self._require_collection()
        try:
            collection.delete(where={"filename": filename})
        except Exception as error:
            raise ValueError("Invalid collection") from error
        return {"deleted": True, "filename": filename}