from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.api.knowledge import router as knowledge_router
from app.api.prompts import router as prompts_router
from app.api.evaluation import router as evaluation_router

app = FastAPI(
    title="AI Conversation Studio API",
    version="1.0.0",
    description="Backend AI Service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(knowledge_router)
app.include_router(prompts_router)
app.include_router(evaluation_router)


@app.get("/")
def root():
    return {
        "message": "AI Conversation Studio API",
        "status": "running"
    }
