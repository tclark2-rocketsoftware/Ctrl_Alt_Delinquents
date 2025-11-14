# Personality mapping and scoring
from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Dict, Any
from collections import Counter
import json
import logging

# Initialize logger
logger = logging.getLogger(__name__)


def calculate_score(questions: List[Any], user_answers: List[int]) -> int:
    """Calculate score for trivia quiz based on correct answers"""
    if not questions or not user_answers:
        return 0
    
    # Build a map of answer_id to is_correct from questions
    correct_answer_ids = set()
    for question in questions:
        for answer in question.answers:
            if answer.is_correct:
                correct_answer_ids.add(answer.id)
    
    # Count how many user answers are correct
    score = sum(1 for answer_id in user_answers if answer_id in correct_answer_ids)
    return score


def calculate_personality_weighted(user_answers_data: List[Any], quiz_personalities: List[Any]) -> Dict[str, Any]:
    """Calculate personality based on weighted scoring system
    
    Args:
        user_answers_data: List of answer objects with personality_weights
        quiz_personalities: List of personality outcome definitions
    
    Returns:
        Dict containing winning personality information
    """
    if not user_answers_data or not quiz_personalities:
        return None
    
    # Initialize personality scores
    personality_scores = {}
    for personality in quiz_personalities:
        personality_id = personality.get('id') if isinstance(personality, dict) else getattr(personality, 'id', None)
        if personality_id:
            personality_scores[personality_id] = 0
    
    # Calculate weighted scores
    for answer_data in user_answers_data:
        try:
            # Get personality weights from answer
            weights = None
            if hasattr(answer_data, 'personality_weights') and answer_data.personality_weights:
                if isinstance(answer_data.personality_weights, str):
                    weights = json.loads(answer_data.personality_weights)
                else:
                    weights = answer_data.personality_weights
            elif isinstance(answer_data, dict):
                weights = answer_data.get('personality_weights', {})
            
            if weights and isinstance(weights, dict):
                for personality_id, weight in weights.items():
                    if personality_id in personality_scores and isinstance(weight, (int, float)):
                        personality_scores[personality_id] += weight
        except (AttributeError, TypeError, json.JSONDecodeError):
            continue
    
    # Find personality with highest score
    if not personality_scores or max(personality_scores.values()) == 0:
        return None
    
    winning_personality_id = max(personality_scores, key=personality_scores.get)
    
    # Find the full personality data
    for personality in quiz_personalities:
        personality_id = personality.get('id') if isinstance(personality, dict) else getattr(personality, 'id', None)
        if personality_id == winning_personality_id:
            return {
                'id': personality_id,
                'name': personality.get('name') if isinstance(personality, dict) else getattr(personality, 'name', ''),
                'description': personality.get('description') if isinstance(personality, dict) else getattr(personality, 'description', ''),
                'emoji': personality.get('emoji') if isinstance(personality, dict) else getattr(personality, 'emoji', ''),
                'image_url': personality.get('image_url') if isinstance(personality, dict) else getattr(personality, 'image_url', ''),
                'score': personality_scores[winning_personality_id],
                'all_scores': personality_scores
            }
    
    return None


def calculate_personality(user_answers_data: List[Any]) -> str:
    """Calculate personality based on answer tags
    
    Args:
        user_answers_data: List of answer objects or dicts with personality_tag attribute/key
    
    Returns:
        Most common personality tag, None if no valid tags found
    """
    if not user_answers_data:
        return None
    
    # Extract personality tags from answers (supports both objects and dicts)
    personality_tags = []
    for answer_data in user_answers_data:
        # Try attribute access first (for Mock/model objects), then dict access
        try:
            tag = getattr(answer_data, 'personality_tag', None)
            if tag is None and isinstance(answer_data, dict):
                tag = answer_data.get('personality_tag')
        except (AttributeError, TypeError):
            if isinstance(answer_data, dict):
                tag = answer_data.get('personality_tag')
            else:
                tag = None
        
        # Filter out None, empty strings, and whitespace-only strings
        if tag and isinstance(tag, str) and tag.strip():
            personality_tags.append(tag)
    
    if not personality_tags:
        return None
    
    # Count occurrences of each personality tag
    personality_counter = Counter(personality_tags)
    most_common = personality_counter.most_common(1)
    
    if most_common:
        return most_common[0][0]
    
    return None


def create_result(
    db: Session,
    quiz_id: int,
    user_id: int,
    score: int = None,
    total: int = None,
    personality: str = None
) -> models.Result:
    """Create a new result entry
    
    Args:
        db: Database session
        quiz_id: ID of the quiz
        user_id: ID of the user
        score: Score achieved (for trivia quizzes)
        total: Total possible score (optional, for reference)
        personality: Personality type determined (for personality quizzes)
    
    Returns:
        Created Result model instance
    """
    result = models.Result(
        quiz_id=quiz_id,
        user_id=user_id,
        score=score,
        personality=personality
    )
    
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


def get_result_by_id(db: Session, result_id: int):
    """Get a specific result by ID"""
    return db.query(models.Result).filter(models.Result.id == result_id).first()


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
        # Calculate personality for personality quiz using weighted scoring
        try:
            # Parse quiz personalities from the quiz data
            import json
            quiz_personalities = []
            if hasattr(quiz, 'personalities') and quiz.personalities:
                if isinstance(quiz.personalities, str):
                    quiz_personalities = json.loads(quiz.personalities)
                else:
                    quiz_personalities = quiz.personalities
            
            if quiz_personalities:
                # Use weighted personality calculation first
                personality_outcome = calculate_personality_weighted(answers, quiz_personalities)
                if personality_outcome:
                    result.personality = personality_outcome['name']
                    result.personality_data = json.dumps(personality_outcome)
                else:
                    # Fallback to tag-based counting if no weighted outcome produced
                    personality_tags = [answer.personality_tag for answer in answers if answer.personality_tag]
                    if personality_tags:
                        personality_counter = Counter(personality_tags)
                        winning_id = personality_counter.most_common(1)[0][0]
                        # Map ID to definition name if available
                        winning_name = None
                        for p in quiz_personalities:
                            pid = p.get('id') if isinstance(p, dict) else getattr(p, 'id', None)
                            if pid == winning_id:
                                winning_name = p.get('name') if isinstance(p, dict) else getattr(p, 'name', None)
                                break
                        # Set result.personality to human-readable name (fallback to id)
                        result.personality = winning_name or winning_id
                        total = sum(personality_counter.values())
                        percentages = {tag: count / total for tag, count in personality_counter.items() if total > 0}
                        outcome_payload = {
                            "id": winning_id,
                            "name": winning_name or winning_id,
                            "description": None,
                            "emoji": None,
                            "image_url": None,
                            "winning": winning_id,
                            "counts": dict(personality_counter),
                            "percentages": percentages
                        }
                        try:
                            result.personality_data = json.dumps(outcome_payload)
                        except Exception:
                            pass
            else:
                # Fallback to old personality tag system
                personality_tags = [answer.personality_tag for answer in answers if answer.personality_tag]
                if personality_tags:
                    personality_counter = Counter(personality_tags)
                    most_common = personality_counter.most_common(1)[0][0]
                    result.personality = most_common
        except Exception as e:
            # Fallback to old system if there's any error
            personality_tags = [answer.personality_tag for answer in answers if answer.personality_tag]
            if personality_tags:
                personality_counter = Counter(personality_tags)
                winning_id = personality_counter.most_common(1)[0][0]
                # Attempt to map to personality name from quiz definitions
                winning_name = None
                quiz_personalities = []
                try:
                    if hasattr(quiz, 'personalities') and quiz.personalities:
                        if isinstance(quiz.personalities, str):
                            quiz_personalities = json.loads(quiz.personalities)
                        else:
                            quiz_personalities = quiz.personalities
                    for p in quiz_personalities:
                        pid = p.get('id') if isinstance(p, dict) else getattr(p, 'id', None)
                        if pid == winning_id:
                            winning_name = p.get('name') if isinstance(p, dict) else getattr(p, 'name', None)
                            break
                except Exception:
                    pass
                result.personality = winning_name or winning_id
                total = sum(personality_counter.values())
                percentages = {tag: count / total for tag, count in personality_counter.items() if total > 0}
                outcome_payload = {
                    "id": winning_id,
                    "name": winning_name or winning_id,
                    "description": None,
                    "emoji": None,
                    "image_url": None,
                    "winning": winning_id,
                    "counts": dict(personality_counter),
                    "percentages": percentages
                }
                try:
                    result.personality_data = json.dumps(outcome_payload)
                except Exception:
                    pass
    
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
        "personality_content": None,
        "personality_outcome": None
    }

    # Add new personality outcome data if available
    if hasattr(result, 'personality_data') and result.personality_data:
        try:
            parsed = json.loads(result.personality_data)
            # If missing a human-readable name, attempt to map via quiz personalities
            if (not parsed.get('name')) and parsed.get('id'):
                quiz = db.query(models.Quiz).filter(models.Quiz.id == result.quiz_id).first()
                if quiz and getattr(quiz, 'personalities', None):
                    quiz_personalities = []
                    try:
                        if isinstance(quiz.personalities, str):
                            quiz_personalities = json.loads(quiz.personalities)
                        else:
                            quiz_personalities = quiz.personalities
                        for p in quiz_personalities:
                            pid = p.get('id') if isinstance(p, dict) else getattr(p, 'id', None)
                            if pid == parsed.get('id'):
                                name_val = p.get('name') if isinstance(p, dict) else getattr(p, 'name', None)
                                if name_val:
                                    parsed['name'] = name_val
                                # Also map description/emoji/image_url if absent
                                for field in ['description','emoji','image_url']:
                                    if not parsed.get(field) and (
                                        (isinstance(p, dict) and p.get(field)) or getattr(p, field, None)
                                    ):
                                        parsed[field] = p.get(field) if isinstance(p, dict) else getattr(p, field, None)
                                break
                    except Exception:
                        pass
            result_dict["personality_outcome"] = parsed
            # Ensure top-level personality mirrors readable name
            if parsed.get('name'):
                result_dict['personality'] = parsed.get('name')
        except (json.JSONDecodeError, TypeError):
            pass

    # Keep old personality content for backward compatibility
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
