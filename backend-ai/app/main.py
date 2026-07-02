from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import GEMINI_MODEL_NAME, GROQ_MODEL_NAME
from app.core.database import engine, Base
import app.models

from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.api.retrieval import router as retrieval_router
from app.api.knowledge import router as knowledge_router
from app.api.prompts import router as prompts_router
from app.api.feedback import router as feedback_router
from app.api.admin import router as admin_router

from app.core.logging import setup_logging

setup_logging()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully.")
    except Exception:
        logger.exception("Database initialization failed.")

    yield


app = FastAPI(
    title="AI Conversation Studio API",
    version="1.0.0",
    description="Backend AI Service",
    lifespan=lifespan,
)

logger.info("Gemini Model: %s", GEMINI_MODEL_NAME)
logger.info("Groq Model: %s", GROQ_MODEL_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        # Replace after Vercel deployment
        "https://ai-conversation-studio-phi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(retrieval_router)
app.include_router(knowledge_router)
app.include_router(prompts_router)
app.include_router(feedback_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "message": "AI Conversation Studio API",
        "status": "running",
    }