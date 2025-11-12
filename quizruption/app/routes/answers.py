# Submit answers endpoint
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services import result_service

router = APIRouter()


@router.post("/submit", response_model=schemas.DetailedResultResponse)
async def submit_quiz(
    submission: schemas.QuizSubmission,
    db: Session = Depends(get_db)
):
    """Submit quiz answers and calculate result"""
    try:
        result = result_service.calculate_result(db, submission)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing submission: {str(e)}")
