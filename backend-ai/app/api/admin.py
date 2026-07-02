from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.dependencies import get_current_user_id
from app.models import Conversation, UploadedDocument, Message, Prompt, Feedback

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        # Get total conversations
        total_conversations = db.query(Conversation).count()

        # Get total feedback submitted
        total_feedback = db.query(Feedback).count()

        # Average response score
        avg_rating = db.query(func.avg(Feedback.rating)).scalar()
        average_score = f"{(avg_rating / 5) * 100:.1f}%" if avg_rating else "N/A"

        # Knowledge sources
        total_sources = db.query(UploadedDocument).count()

        # Recent conversations
        recent_convs = db.query(Conversation).order_by(Conversation.createdAt.desc()).limit(5).all()
        recent_conversations = []
        for conv in recent_convs:
            recent_conversations.append({
                "id": conv.id,
                "question": conv.title,
                "score": "N/A", # Need per-conversation feedback for this
                "status": "Resolved", 
                "date": conv.createdAt.strftime("%b %d, %Y") if conv.createdAt else "Unknown"
            })

        # Feedback entries
        recent_feedbacks = db.query(Feedback).order_by(Feedback.createdAt.desc()).limit(5).all()
        feedback_entries = []
        for fb in recent_feedbacks:
            conv = db.query(Conversation).filter(Conversation.id == fb.conversationId).first()
            feedback_entries.append({
                "conversation": conv.title if conv else "Unknown Conversation",
                "rating": f"{fb.rating}/5",
                "comment": fb.comment,
                "date": fb.createdAt.strftime("%b %d, %Y") if fb.createdAt else "Unknown"
            })

        return {
            "success": True,
            "stats": {
                "total_conversations": str(total_conversations),
                "average_score": str(average_score),
                "total_feedback": str(total_feedback),
                "total_sources": str(total_sources)
            },
            "recent_conversations": recent_conversations,
            "feedback_entries": feedback_entries
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
