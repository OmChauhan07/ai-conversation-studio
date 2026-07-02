from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
import uuid
from typing import Optional

from app.core.exceptions import InvalidModelError, KnowledgeBaseEmptyError, NoRelevantKnowledgeError, ProviderUnavailableError
from app.services.chat_service import ChatService
from app.core.database import get_db
from app.api.dependencies import get_current_user_id
from app.models import Conversation, Message, MessageRole

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


class ChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None


@router.post("/")
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        if not request.message or not request.message.strip():
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Message cannot be empty."},
            )

        # Handle conversation continuation or creation
        if request.conversationId:
            conversation = db.query(Conversation).filter_by(id=request.conversationId, userId=user_id).first()
            if not conversation:
                return JSONResponse(status_code=404, content={"success": False, "message": "Conversation not found"})
            conversation_id = conversation.id
        else:
            conversation_id = str(uuid.uuid4())
            new_conversation = Conversation(
                id=conversation_id,
                userId=user_id,
                title=request.message[:50] + "..." if len(request.message) > 50 else request.message
            )
            db.add(new_conversation)

        # Save user message
        user_message = Message(
            id=str(uuid.uuid4()),
            conversationId=conversation_id,
            role=MessageRole.USER,
            content=request.message
        )
        db.add(user_message)
        db.commit()

        # Run AI logic
        chat_service = ChatService()
        result = await chat_service.chat(request.message)

        # Save assistant message
        assistant_message = Message(
            id=str(uuid.uuid4()),
            conversationId=conversation_id,
            role=MessageRole.ASSISTANT,
            content=result["answer"],
            provider=result["metadata"].get("provider"),
            model=result["metadata"].get("model"),
            sources=result["sources"]
        )
        db.add(assistant_message)
        db.commit()

        return {
            "success": True,
            "conversationId": conversation_id,
            **result,
        }
    except KnowledgeBaseEmptyError as error:
        return JSONResponse(status_code=404, content={"success": False, "message": str(error)})
    except NoRelevantKnowledgeError as error:
        return JSONResponse(status_code=404, content={"success": False, "message": str(error)})
    except InvalidModelError as error:
        return JSONResponse(status_code=500, content={"success": False, "message": str(error)})
    except ProviderUnavailableError as error:
        return JSONResponse(status_code=502, content={"success": False, "message": str(error)})
    except ValueError as error:
        return JSONResponse(status_code=400, content={"success": False, "message": str(error)})
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(error)},
        )

@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        conversations = db.query(Conversation).filter_by(userId=user_id).order_by(desc(Conversation.createdAt)).all()
        return {
            "success": True,
            "conversations": [
                {
                    "id": c.id,
                    "title": c.title,
                    "createdAt": c.createdAt.isoformat() if c.createdAt else None,
                    "updatedAt": c.updatedAt.isoformat() if c.updatedAt else None
                } for c in conversations
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}")
def get_conversation_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        # verify ownership
        conversation = db.query(Conversation).filter_by(id=conversation_id, userId=user_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages = db.query(Message).filter_by(conversationId=conversation_id).order_by(Message.createdAt).all()
        return {
            "success": True,
            "conversation": {
                "id": conversation.id,
                "title": conversation.title
            },
            "messages": [
                {
                    "id": m.id,
                    "role": m.role.value if m.role else None,
                    "content": m.content,
                    "sources": m.sources,
                    "createdAt": m.createdAt.isoformat() if m.createdAt else None
                } for m in messages
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        conversation = db.query(Conversation).filter_by(id=conversation_id, userId=user_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        # Delete messages first due to foreign key
        db.query(Message).filter_by(conversationId=conversation_id).delete()
        db.delete(conversation)
        db.commit()
        
        return {"success": True, "message": "Conversation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))