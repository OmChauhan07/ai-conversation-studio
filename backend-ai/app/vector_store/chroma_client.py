import chromadb

from app.core.config import CHROMA_DB_PATH

client = chromadb.PersistentClient(
    path=CHROMA_DB_PATH
)

collection = client.get_or_create_collection(
    name="knowledge_base"
)