from fastapi import APIRouter

router = APIRouter(
    prefix="/prompts",
    tags=["Prompts"]
)


@router.get("/")
def prompts():
    return {
        "message": "Prompt endpoint coming soon"
    }