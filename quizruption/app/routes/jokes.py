from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.joke_service import get_daily_joke
from app.models import JokeSuggestion
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()


class SuggestionRequest(BaseModel):
    suggestion_text: str
    user_id: Optional[int] = None


@router.get('/daily', summary='Get today\'s joke', description='Returns a single AI (or fallback) generated joke cached for the day.')
def daily_joke(db: Session = Depends(get_db)):
    return get_daily_joke(db)


@router.post('/suggestions', summary='Submit joke theme suggestion', description='Allows users to suggest themes for future daily jokes.')
def create_suggestion(suggestion: SuggestionRequest, db: Session = Depends(get_db)):
    new_suggestion = JokeSuggestion(
        suggestion_text=suggestion.suggestion_text,
        user_id=suggestion.user_id,
        used=False
    )
    db.add(new_suggestion)
    db.commit()
    db.refresh(new_suggestion)
    return {"success": True, "message": "Thank you for your suggestion!"}


@router.get('/logs', summary='View recent application logs', description='Returns recent backend logs to help diagnose OpenAI requests.')
def get_logs():
    log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app.log')
    log_path = os.path.normpath(log_path)
    try:
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        # Return last ~4000 characters to avoid huge payloads
        tail = content[-4000:] if len(content) > 4000 else content
        return {"log_tail": tail}
    except FileNotFoundError:
        return {"log_tail": "No log file yet. Trigger endpoints to generate logs."}
