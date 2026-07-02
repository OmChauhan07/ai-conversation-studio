import chromadb

from app.core.config import CHROMA_COLLECTION_NAME, CHROMA_DB_PATH

client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

_collection = None


def get_collection():
    global _collection

    if _collection is None:
        _collection = client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    return _collection


collection = get_collection()