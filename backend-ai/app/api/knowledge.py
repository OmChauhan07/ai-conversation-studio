from fastapi import APIRouter

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge"]
)


@router.get("/")
def knowledge():
    return {
        "message": "Knowledge endpoint coming soon"
    }