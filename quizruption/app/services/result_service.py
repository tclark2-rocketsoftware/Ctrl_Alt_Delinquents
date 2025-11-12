# Personality mapping and scoring
from sqlalchemy.orm import Session
from app import models, schemas
from typing import List
from collections import Counter


def calculate_result(db: Session, submission: schemas.QuizSubmission):
    """Calculate quiz result based on submitted answers"""
    quiz = db.query(models.Quiz).filter(models.Quiz.id == submission.quiz_id).first()
    if not quiz:
        raise ValueError("Quiz not found")
    
    # Validate answers exist
    answers = db.query(models.Answer).filter(
        models.Answer.id.in_(submission.answers)
    ).all()
    
    if len(answers) != len(submission.answers):
        raise ValueError("Invalid answer IDs provided")
    
    result = models.Result(
        quiz_id=submission.quiz_id,
        user_id=submission.user_id
    )
    
    if quiz.type == "trivia":
        # Calculate score for trivia quiz
        score = sum(1 for answer in answers if answer.is_correct)
        result.score = score
    else:
        # Calculate personality for personality quiz
        personality_tags = [answer.personality_tag for answer in answers if answer.personality_tag]
        if personality_tags:
            # Get most common personality tag
            personality_counter = Counter(personality_tags)
            most_common = personality_counter.most_common(1)[0][0]
            result.personality = most_common
    
    db.add(result)
    db.commit()
    db.refresh(result)
    
    # Get personality content if applicable
    return get_result_with_content(db, result.id)


def get_result_with_content(db: Session, result_id: int):
    """Get result with personality content"""
    result = db.query(models.Result).filter(models.Result.id == result_id).first()
    if not result:
        return None
    
    result_dict = {
        "id": result.id,
        "quiz_id": result.quiz_id,
        "user_id": result.user_id,
        "score": result.score,
        "personality": result.personality,
        "created_at": result.created_at,
        "personality_content": None
    }
    
    if result.personality:
        content = db.query(models.PersonalityContent).filter(
            models.PersonalityContent.personality == result.personality
        ).first()
        
        if content:
            result_dict["personality_content"] = {
                "personality": content.personality,
                "quote": content.quote,
                "gif_url": content.gif_url,
                "joke": content.joke
            }
    
    return result_dict


def get_results_by_quiz(
    db: Session,
    quiz_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.Result]:
    """Get all results for a specific quiz"""
    return db.query(models.Result).filter(
        models.Result.quiz_id == quiz_id
    ).offset(skip).limit(limit).all()


def get_results_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.Result]:
    """Get all results for a specific user"""
    return db.query(models.Result).filter(
        models.Result.user_id == user_id
    ).offset(skip).limit(limit).all()
