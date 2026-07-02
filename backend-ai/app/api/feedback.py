import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.dependencies import get_current_user_id
from app.models import Feedback, Conversation

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"]
)

class FeedbackCreate(BaseModel):
    conversationId: str
    rating: int
    comment: str = None

@router.get("/")
def list_feedback(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    feedbacks = db.query(Feedback).filter_by(userId=user_id).order_by(desc(Feedback.createdAt)).all()
    results = []
    for fb in feedbacks:
        conv = db.query(Conversation).filter_by(id=fb.conversationId).first()
        results.append({
            "id": fb.id,
            "conversationId": fb.conversationId,
            "conversationTitle": conv.title if conv else "Unknown",
            "rating": fb.rating,
            "comment": fb.comment,
            "createdAt": fb.createdAt.isoformat() if fb.createdAt else None
        })
    return {"success": True, "feedback": results}

@router.post("/")
def create_feedback(request: FeedbackCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    if request.rating < 1 or request.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if conversation belongs to user
    conv = db.query(Conversation).filter_by(id=request.conversationId, userId=user_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    new_fb = Feedback(
        id=str(uuid.uuid4()),
        userId=user_id,
        conversationId=request.conversationId,
        rating=request.rating,
        comment=request.comment
    )
    db.add(new_fb)
    db.commit()
    return {"success": True, "feedback": {"id": new_fb.id}}
