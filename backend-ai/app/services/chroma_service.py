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
    - Delete document embeddings
    """

    def __init__(self, collection=None):
        self.collection = collection or get_collection()

    def _require_collection(self):
        if self.collection is None:
            logger.error("ChromaDB collection is unavailable.")
            raise ValueError("Invalid ChromaDB collection.")

        return self.collection

    def add_documents(
        self,
        ids: list[str],
        documents: list[str],
        metadatas: list[dict[str, Any]],
        embeddings: list[list[float]],
    ) -> dict[str, Any]:

        collection = self._require_collection()

        if not documents:
            logger.warning("No documents received for indexing.")
            return {"added": 0}

        if not (
            len(ids)
            == len(documents)
            == len(metadatas)
            == len(embeddings)
        ):
            logger.error(
                "Document insertion failed because collection sizes do not match."
            )
            raise ValueError(
                "ids, documents, metadatas and embeddings must all have the same length."
            )

        logger.info(
            "Adding %d document chunks to ChromaDB.",
            len(documents),
        )

        try:
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings,
            )

            logger.info(
                "Successfully indexed %d chunks.",
                len(documents),
            )

            return {
                "added": len(documents)
            }

        except Exception:
            logger.exception("Failed to add documents to ChromaDB.")
            raise

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[dict[str, Any]]:

        collection = self._require_collection()

        total_chunks = collection.count()

        logger.info(
            "Searching ChromaDB (%d indexed chunks).",
            total_chunks,
        )

        if total_chunks == 0:
            raise KnowledgeBaseEmptyError(
                "Knowledge base is empty."
            )

        try:
            result = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                include=[
                    "documents",
                    "metadatas",
                    "distances",
                ],
            )

        except Exception:
            logger.exception("ChromaDB query failed.")
            raise

        documents = (result.get("documents") or [[]])[0]
        metadatas = (result.get("metadatas") or [[]])[0]
        distances = (result.get("distances") or [[]])[0]
        ids = (result.get("ids") or [[]])[0]

        chunks: list[dict[str, Any]] = []

        for doc_id, document, metadata, distance in zip(
            ids,
            documents,
            metadatas,
            distances,
        ):
            similarity = max(
                0.0,
                min(
                    1.0,
                    1 - float(distance),
                ),
            )

            chunks.append(
                {
                    "id": doc_id,
                    "chunk": document,
                    "metadata": metadata or {},
                    "distance": float(distance),
                    "score": similarity,
                }
            )

        logger.info(
            "Retrieved %d matching chunks.",
            len(chunks),
        )

        return chunks

    def delete_document(
        self,
        filename: str,
    ):

        collection = self._require_collection()

        logger.info(
            "Deleting document '%s' from ChromaDB.",
            filename,
        )

        try:
            collection.delete(
                where={
                    "filename": filename,
                }
            )

            logger.info(
                "Successfully deleted embeddings for '%s'.",
                filename,
            )

            return {
                "deleted": True,
                "filename": filename,
            }

        except Exception:
            logger.exception(
                "Failed to delete document '%s'.",
                filename,
            )
            raise