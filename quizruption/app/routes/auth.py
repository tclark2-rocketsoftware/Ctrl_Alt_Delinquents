# Authentication routes for user login and registration
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.config import settings
from app.models import User, Quiz, Result, JokeSuggestion
from app import schemas
import jwt
import logging
from datetime import datetime, timedelta
from typing import List

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Use centralized settings for security parameters
SECRET_KEY = settings.secret_key
ALGORITHM = settings.jwt_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
# Initialize logger
logger = logging.getLogger(__name__)



class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email
    )
    new_user.set_password(user_data.password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.username, "user_id": new_user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user.to_dict()
    }


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    
    # Find user by username
    user = db.query(User).filter(User.username == user_data.username).first()
    
    if not user or not user.check_password(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username, "user_id": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }


@router.get("/me")
async def get_current_user(token: str, db: Session = Depends(get_db)):
    """Get current user info"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user.to_dict()


@router.put("/profile", response_model=schemas.UserProfile)
async def update_profile(
    profile_data: schemas.UserProfileUpdate,
    token: str,
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Update profile fields
    if profile_data.display_name is not None:
        user.display_name = profile_data.display_name
    if profile_data.bio is not None:
        user.bio = profile_data.bio
    if profile_data.location is not None:
        user.location = profile_data.location
    if profile_data.website is not None:
        user.website = profile_data.website
    if profile_data.profile_image_url is not None:
        user.profile_image_url = profile_data.profile_image_url
    
    db.commit()
    db.refresh(user)
    
    return user


@router.get("/profile/{user_id}", response_model=schemas.UserPublicProfile)
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get public profile of a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.get("/profile/{user_id}/stats")
async def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user statistics including quizzes created, taken, and personality traits"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get quizzes created by user
    quizzes_created = db.query(Quiz).filter(Quiz.created_by == user_id).all()
    
    # Get quizzes taken by user (results) - include quiz information
    results = db.query(Result).join(Quiz, Result.quiz_id == Quiz.id).filter(Result.user_id == user_id).order_by(Result.created_at.desc()).all()
    
    # Get personality results (separate from trivia)
    personality_results = [r for r in results if r.personality]
    trivia_results = [r for r in results if r.score is not None and not r.personality]
    
    # Get unique personality traits discovered
    personality_traits = list(set([r.personality for r in personality_results]))
    
    # Get joke suggestions made by user
    joke_suggestions = db.query(JokeSuggestion).filter(
        JokeSuggestion.user_id == user_id
    ).order_by(JokeSuggestion.created_at.desc()).all()
    
    # Get recent activity
    recent_quizzes = db.query(Quiz).filter(Quiz.created_by == user_id).order_by(Quiz.created_at.desc()).limit(5).all()
    recent_results = db.query(Result).filter(Result.user_id == user_id).order_by(Result.created_at.desc()).limit(5).all()
    
    return {
        "user": user.to_public_dict(),
        "stats": {
            "quizzes_created": len(quizzes_created),
            "quizzes_taken": len(results),
            "personality_quizzes_taken": len(personality_results),
            "trivia_quizzes_taken": len(trivia_results),
            "personality_traits_discovered": len(personality_traits),
            "joke_suggestions_submitted": len(joke_suggestions),
            "member_since": user.created_at.isoformat() if user.created_at else None
        },
        "quizzes_created": [
            {
                "id": q.id,
                "title": q.title,
                "description": q.description,
                "type": q.type,
                "created_at": q.created_at.isoformat() if q.created_at else None
            } for q in quizzes_created
        ],
        "personality_results": [
            {
                "id": r.id,
                "quiz_id": r.quiz_id,
                "quiz_title": r.quiz.title if r.quiz else "Unknown Quiz",
                "personality": r.personality,
                "personality_data": r.personality_data,  # Include full personality outcome data
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in personality_results
        ],
        "trivia_results": [
            {
                "id": r.id,
                "quiz_id": r.quiz_id,
                "quiz_title": r.quiz.title if r.quiz else "Unknown Quiz",
                "score": r.score,
                "total_questions": r.quiz.questions.count() if r.quiz else 0,
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in trivia_results
        ],
        "joke_suggestions": [
            {
                "id": s.id,
                "suggestion_text": s.suggestion_text,
                "used": s.used,
                "created_at": s.created_at.isoformat() if s.created_at else None
            } for s in joke_suggestions
        ],
        "personality_traits": personality_traits,
        "recent_activity": {
            "recent_quizzes": [
                {
                    "id": q.id,
                    "title": q.title,
                    "type": q.type,
                    "created_at": q.created_at.isoformat() if q.created_at else None
                } for q in recent_quizzes
            ],
            "recent_results": [
                {
                    "id": r.id,
                    "quiz_id": r.quiz_id,
                    "personality": r.personality,
                    "score": r.score,
                    "created_at": r.created_at.isoformat() if r.created_at else None
                } for r in recent_results
            ]
        }
    }
