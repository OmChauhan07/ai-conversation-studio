from pydantic import BaseModel
from fastapi import APIRouter
from fastapi.responses import JSONResponse

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
    except ValueError as error:
        message = str(error)
        if message == "Message cannot be empty.":
            return JSONResponse(status_code=400, content={"success": False, "message": message})

        if message == "No providers available":
            return JSONResponse(status_code=500, content={"success": False, "message": message})

        if message == "Empty database":
            return JSONResponse(status_code=404, content={"success": False, "message": message})

        return JSONResponse(status_code=400, content={"success": False, "message": message})
    except LookupError:
        return JSONResponse(
            status_code=200,
            content={"success": False, "message": "No relevant knowledge found."},
        )
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(error)},
        )