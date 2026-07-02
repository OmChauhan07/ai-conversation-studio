import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.dependencies import get_current_user_id
from app.models import Prompt, PromptRun
from app.services.chat_service import ChatService

router = APIRouter(
    prefix="/prompts",
    tags=["Prompts"]
)

class PromptCreate(BaseModel):
    name: str
    description: str = None
    content: str
    isFavorite: bool = False

class PromptUpdate(BaseModel):
    name: str = None
    description: str = None
    content: str = None
    isFavorite: bool = None

class PromptRunRequest(BaseModel):
    promptId: str
    variables: dict = {}

@router.get("/")
def list_prompts(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    prompts = db.query(Prompt).filter_by(userId=user_id).order_by(desc(Prompt.createdAt)).all()
    return {
        "success": True,
        "prompts": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "content": p.content,
                "isFavorite": p.isFavorite,
                "createdAt": p.createdAt.isoformat() if p.createdAt else None
            } for p in prompts
        ]
    }

@router.post("/")
def create_prompt(request: PromptCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    try:
        new_prompt = Prompt(
            id=str(uuid.uuid4()),
            userId=user_id,
            name=request.name,
            description=request.description,
            content=request.content,
            isFavorite=request.isFavorite
        )
        db.add(new_prompt)
        db.commit()
        return {"success": True, "prompt": {"id": new_prompt.id, "name": new_prompt.name}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{prompt_id}")
def update_prompt(prompt_id: str, request: PromptUpdate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    prompt = db.query(Prompt).filter_by(id=prompt_id, userId=user_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    if request.name is not None: prompt.name = request.name
    if request.description is not None: prompt.description = request.description
    if request.content is not None: prompt.content = request.content
    if request.isFavorite is not None: prompt.isFavorite = request.isFavorite

    db.commit()
    return {"success": True, "message": "Prompt updated"}

@router.delete("/{prompt_id}")
def delete_prompt(prompt_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    prompt = db.query(Prompt).filter_by(id=prompt_id, userId=user_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Delete runs first
    db.query(PromptRun).filter_by(promptId=prompt_id).delete()
    db.delete(prompt)
    db.commit()
    return {"success": True, "message": "Prompt deleted"}

@router.post("/run")
async def run_prompt(request: PromptRunRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    prompt = db.query(Prompt).filter_by(id=request.promptId, userId=user_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Replace variables if any (naive replacement for MVP)
    content = prompt.content
    for key, val in request.variables.items():
        content = content.replace(f"{{{{{key}}}}}", str(val)).replace(f"{{{key}}}", str(val))

    try:
        chat_service = ChatService()
        result = await chat_service.chat(content)

        prompt_run = PromptRun(
            id=str(uuid.uuid4()),
            promptId=prompt.id,
            result=result["answer"],
            model=result["metadata"].get("model", "unknown"),
            provider=result["metadata"].get("provider", "unknown")
        )
        db.add(prompt_run)
        db.commit()

        return {
            "success": True,
            "answer": result["answer"],
            "metadata": result["metadata"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))