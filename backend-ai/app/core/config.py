from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME")
GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME")
RETRIEVAL_MIN_SCORE = float(os.getenv("RETRIEVAL_MIN_SCORE", "0.3"))

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "knowledge_base")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-small-en-v1.5")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Create directories if they don't exist
os.makedirs(CHROMA_DB_PATH, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)