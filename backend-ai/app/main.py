from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import GEMINI_MODEL_NAME, GROQ_MODEL_NAME

from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.api.retrieval import router as retrieval_router
from app.api.knowledge import router as knowledge_router
from app.api.prompts import router as prompts_router
from app.api.evaluation import router as evaluation_router
from app.core.logging import setup_logging

# Database imports
from app.core.database import engine, Base
from app.models import (  # noqa: F401 — registers all models with Base.metadata
    User, Conversation, Message, UploadedDocument, Prompt, PromptRun,
)
from sqlalchemy import text

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle for the FastAPI app."""
    # ── Startup ─────────────────────────────────────────────────────
    logger.info("Connecting to Neon PostgreSQL via SQLAlchemy...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        logger.info("✅ Database connection established successfully.")
    except Exception as exc:
        logger.error("❌ Database connection failed: %s", exc)
        raise

    yield

    # ── Shutdown ────────────────────────────────────────────────────
    engine.dispose()
    logger.info("Database connection pool disposed.")


app = FastAPI(
    title="AI Conversation Studio API",
    version="1.0.0",
    description="Backend AI Service",
    lifespan=lifespan,
)

print("Gemini Model:", GEMINI_MODEL_NAME)
print("Groq Model:", GROQ_MODEL_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(retrieval_router)
app.include_router(knowledge_router)
app.include_router(prompts_router)
app.include_router(evaluation_router)


@app.get("/")
def root():
    return {
        "message": "AI Conversation Studio API",
        "status": "running"
    }

