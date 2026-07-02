from pydantic import BaseModel
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uuid

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

        # Create a new conversation for this chat interaction (since frontend doesn't supply one yet)
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