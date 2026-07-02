from __future__ import annotations

import logging
from typing import Any

from app.core.exceptions import KnowledgeBaseEmptyError
from app.vector_store.chroma_client import get_collection


logger = logging.getLogger(__name__)


class ChromaService:
    """
    Handles all interactions with ChromaDB.

    Responsibilities:
    - Add document embeddings
    - Semantic search
    - Delete documents
    """

    def __init__(self, collection=None):
        self.collection = collection or get_collection()

    def _require_collection(self):
        if self.collection is None:
            raise ValueError("Invalid collection")

        return self.collection

    def add_documents(
        self,
        ids: list[str],
        documents: list[str],
        metadatas: list[dict[str, Any]],
        embeddings: list[list[float]],
    ) -> dict[str, Any]:

        collection = self._require_collection()

        if len(documents) == 0:
            return {"added": 0}

        if len(embeddings) != len(documents):
            raise ValueError("Missing embeddings")

        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings,
        )

        return {"added": len(documents)}

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[dict[str, Any]]:

        """Search ChromaDB and return chunks with similarity scores."""

        collection = self._require_collection()

        if collection.count() == 0:
            logger.warning("ChromaDB search attempted on an empty collection")
            raise KnowledgeBaseEmptyError("Knowledge base is empty.")

        result = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=[
                "documents",
                "metadatas",
                "distances",
            ],
        )

        documents = (result.get("documents") or [[]])[0]
        metadatas = (result.get("metadatas") or [[]])[0]
        distances = (result.get("distances") or [[]])[0]
        ids = (result.get("ids") or [[]])[0]

        chunks = []

        for i in range(len(documents)):
            distance = distances[i]

            similarity = max(0.0, min(1.0, 1 - float(distance)))

            chunks.append(
                {
                    "id": ids[i],
                    "chunk": documents[i],
                    "metadata": metadatas[i] or {},
                    "distance": float(distance),
                    "score": similarity,
                }
            )

        return chunks

    def delete_document(self, filename: str):

        collection = self._require_collection()

        collection.delete(
            where={
                "filename": filename
            }
        )

        return {
            "deleted": True,
            "filename": filename,
        }