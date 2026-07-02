from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect

from app.core.database import get_db, engine

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


@router.get("/db")
def health_db(db: Session = Depends(get_db)):
    """Check that the Neon PostgreSQL database is reachable."""
    try:
        db.execute(text("SELECT 1"))
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        return {
            "status": "healthy",
            "database": "connected",
            "tables_found": len(tables),
            "tables": tables,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }