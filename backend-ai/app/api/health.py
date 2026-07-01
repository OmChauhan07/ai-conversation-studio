from fastapi import APIRouter

router = APIRouter(
    prefix="/health",
    tags=["Health"]
)


@router.get("/")
def health():
    return {
        "status": "healthy",
        "service": "AI Conversation Studio"
    }


@router.get("/ping")
def ping():
    return {
        "message": "pong"
    }