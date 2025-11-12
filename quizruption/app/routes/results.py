# Calculate and return results
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas
from app.services import result_service

router = APIRouter()


@router.get("/{result_id}", response_model=schemas.DetailedResultResponse)
async def get_result(result_id: int, db: Session = Depends(get_db)):
    """Fetch result summary with personality content"""
    result = result_service.get_result_with_content(db, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


@router.get("/quiz/{quiz_id}", response_model=List[schemas.ResultResponse])
async def get_quiz_results(
    quiz_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all results for a specific quiz"""
    return result_service.get_results_by_quiz(db, quiz_id, skip=skip, limit=limit)


@router.get("/user/{user_id}", response_model=List[schemas.ResultResponse])
async def get_user_results(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all results for a specific user"""
    return result_service.get_results_by_user(db, user_id, skip=skip, limit=limit)
