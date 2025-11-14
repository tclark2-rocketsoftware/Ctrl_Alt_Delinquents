# Business logic for quizzes
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
import json
from typing import List, Optional


def create_quiz(db: Session, quiz: schemas.QuizCreate):
    """Create a new quiz with questions and answers"""
    personalities_payload = None
    if getattr(quiz, 'personalities', None):
        try:
            personalities_payload = [
                p.dict() if hasattr(p, 'dict') else p for p in quiz.personalities
            ]
        except Exception:
            personalities_payload = None
    db_quiz = models.Quiz(
        title=quiz.title,
        description=quiz.description,
        type=quiz.type,
        created_by=quiz.created_by,
        personalities=json.dumps(personalities_payload) if personalities_payload else None
    )
    db.add(db_quiz)
    db.flush()
    
    for question_data in quiz.questions:
        db_question = models.Question(
            quiz_id=db_quiz.id,
            text=question_data.text
        )
        db.add(db_question)
        db.flush()
        
        for answer_data in question_data.answers:
            db_answer = models.Answer(
                question_id=db_question.id,
                text=answer_data.text,
                is_correct=answer_data.is_correct,
                personality_tag=answer_data.personality_tag
            )
            db.add(db_answer)
    
    db.commit()
    db.refresh(db_quiz)
    return db_quiz


def get_quizzes(
    db: Session,
    quiz_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Quiz]:
    """Get all quizzes with optional filtering by type"""
    query = db.query(models.Quiz).options(joinedload(models.Quiz.creator))
    if quiz_type:
        query = query.filter(models.Quiz.type == quiz_type)
    quizzes = query.offset(skip).limit(limit).all()
    for q in quizzes:
        if getattr(q, 'personalities', None) and isinstance(q.personalities, str):
            try:
                q.personalities = json.loads(q.personalities)
            except Exception:
                q.personalities = None
    return quizzes


def get_quiz(db: Session, quiz_id: int):
    """Get a specific quiz by ID with creator information"""
    q = db.query(models.Quiz)\
        .options(joinedload(models.Quiz.creator))\
        .filter(models.Quiz.id == quiz_id)\
        .first()
    if q and getattr(q, 'personalities', None) and isinstance(q.personalities, str):
        try:
            q.personalities = json.loads(q.personalities)
        except Exception:
            q.personalities = None
    return q


def update_quiz(db: Session, quiz_id: int, quiz: schemas.QuizCreate):
    """Update an existing quiz"""
    db_quiz = get_quiz(db, quiz_id)
    if not db_quiz:
        return None
    db_quiz.title = quiz.title
    db_quiz.description = quiz.description
    db_quiz.type = quiz.type
    if getattr(quiz, 'personalities', None):
        try:
            personalities_payload = [
                p.dict() if hasattr(p, 'dict') else p for p in quiz.personalities
            ]
            db_quiz.personalities = json.dumps(personalities_payload) if personalities_payload else None
        except Exception:
            db_quiz.personalities = None
    else:
        db_quiz.personalities = None
    
    # Delete existing questions and answers
    db.query(models.Question).filter(models.Question.quiz_id == quiz_id).delete()
    
    # Add new questions and answers
    for question_data in quiz.questions:
        db_question = models.Question(
            quiz_id=db_quiz.id,
            text=question_data.text
        )
        db.add(db_question)
        db.flush()
        
        for answer_data in question_data.answers:
            db_answer = models.Answer(
                question_id=db_question.id,
                text=answer_data.text,
                is_correct=answer_data.is_correct,
                personality_tag=answer_data.personality_tag
            )
            db.add(db_answer)
    
    db.commit()
    db.refresh(db_quiz)
    return db_quiz


def delete_quiz(db: Session, quiz_id: int) -> bool:
    """Delete a quiz"""
    db_quiz = get_quiz(db, quiz_id)
    if not db_quiz:
        return False
    
    db.delete(db_quiz)
    db.commit()
    return True
