from fastapi import APIRouter

router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"]
)


@router.get("/")
def evaluation():
    return {
        "message": "Evaluation endpoint coming soon"
    }