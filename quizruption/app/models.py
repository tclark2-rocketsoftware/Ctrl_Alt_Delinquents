# SQLAlchemy models for quizzes, questions, answers, results, users
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Profile fields
    display_name = Column(String(100))  # User's preferred display name
    bio = Column(Text)  # User biography/description
    location = Column(String(100))  # User's location
    website = Column(String(255))  # User's website
    profile_image_url = Column(String(500))  # URL to profile image
    
    # Relationships
    quizzes = relationship("Quiz", back_populates="creator")
    results = relationship("Result", back_populates="user")
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary for JSON response"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'display_name': self.display_name,
            'bio': self.bio,
            'location': self.location,
            'website': self.website,
            'profile_image_url': self.profile_image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def to_public_dict(self):
        """Convert user to dictionary for public viewing (excludes email)"""
        return {
            'id': self.id,
            'username': self.username,
            'display_name': self.display_name or self.username,
            'bio': self.bio,
            'location': self.location,
            'website': self.website,
            'profile_image_url': self.profile_image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    description = Column(Text)
    type = Column(String, nullable=False)  # 'trivia' or 'personality'
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    
    creator = relationship("User", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    text = Column(Text, nullable=False)
    
    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    personality_tag = Column(Text)
    
    question = relationship("Question", back_populates="answers")


class Result(Base):
    __tablename__ = "results"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer)
    personality = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="results")
    quiz = relationship("Quiz", back_populates="results")


class PersonalityContent(Base):
    __tablename__ = "personality_content"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    personality = Column(Text, nullable=False)
    quote = Column(Text)
    gif_url = Column(Text)
    joke = Column(Text)
