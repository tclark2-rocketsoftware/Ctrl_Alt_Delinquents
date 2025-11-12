# Endpoints for quiz CRUD
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas
from app.services import quiz_service

router = APIRouter()


@router.post("/", response_model=schemas.Quiz, status_code=status.HTTP_201_CREATED)
async def create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    """Create a new quiz (Admin or user-generated)"""
    return quiz_service.create_quiz(db, quiz)


@router.get("/", response_model=List[schemas.Quiz])
async def get_quizzes(
    quiz_type: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all available quizzes with optional filters"""
    return quiz_service.get_quizzes(db, quiz_type=quiz_type, skip=skip, limit=limit)


@router.get("/{quiz_id}", response_model=schemas.Quiz)
async def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get a specific quiz by ID"""
    quiz = quiz_service.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.put("/{quiz_id}", response_model=schemas.Quiz)
async def update_quiz(
    quiz_id: int,
    quiz: schemas.QuizCreate,
    db: Session = Depends(get_db)
):
    """Update a quiz (Admin-only functionality)"""
    updated_quiz = quiz_service.update_quiz(db, quiz_id, quiz)
    if not updated_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return updated_quiz


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Delete a quiz (Admin-only functionality)"""
    success = quiz_service.delete_quiz(db, quiz_id)
    if not success:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return None
