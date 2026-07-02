from pydantic import BaseModel
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.exceptions import InvalidModelError, KnowledgeBaseEmptyError, NoRelevantKnowledgeError, ProviderUnavailableError
from app.services.chat_service import ChatService

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


class ChatRequest(BaseModel):
    message: str


@router.post("/")
async def chat(request: ChatRequest):
    try:
        if not request.message or not request.message.strip():
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Message cannot be empty."},
            )

        chat_service = ChatService()
        result = await chat_service.chat(request.message)

        return {
            "success": True,
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