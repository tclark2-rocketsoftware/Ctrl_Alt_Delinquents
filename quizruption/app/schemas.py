# Pydantic schemas for request/response
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# Answer schemas
class AnswerBase(BaseModel):
    text: str
    is_correct: Optional[bool] = False
    personality_tag: Optional[str] = None


class AnswerCreate(AnswerBase):
    pass


class Answer(AnswerBase):
    id: int
    question_id: int
    
    class Config:
        from_attributes = True


# Question schemas
class QuestionBase(BaseModel):
    text: str


class QuestionCreate(QuestionBase):
    answers: List[AnswerCreate]


class Question(QuestionBase):
    id: int
    quiz_id: int
    answers: List[Answer] = []
    
    class Config:
        from_attributes = True


# Quiz schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str  # 'trivia' or 'personality'


class QuizCreate(QuizBase):
    questions: List[QuestionCreate]
    created_by: Optional[int] = None


# User schemas for nested relationships
class QuizCreator(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# User profile schemas
class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserPublicProfile(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class Quiz(QuizBase):
    id: int
    created_by: Optional[int]
    created_at: datetime
    questions: List[Question] = []
    creator: Optional[QuizCreator] = None  # Include creator information
    
    class Config:
        from_attributes = True


# Result schemas
class QuizSubmission(BaseModel):
    quiz_id: int
    user_id: Optional[int] = None
    answers: List[int]  # List of answer IDs


class ResultResponse(BaseModel):
    id: int
    quiz_id: int
    user_id: Optional[int]
    score: Optional[int]
    personality: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class PersonalityContentResponse(BaseModel):
    personality: str
    quote: Optional[str]
    gif_url: Optional[str]
    joke: Optional[str]
    
    class Config:
        from_attributes = True


class DetailedResultResponse(ResultResponse):
    personality_content: Optional[PersonalityContentResponse] = None
    personality_outcome: Optional[dict] = None  # Contains structured personality data (winning, counts, percentages)
