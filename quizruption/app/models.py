# SQLAlchemy models for quizzes, questions, answers, results
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    description = Column(Text)
    type = Column(String, nullable=False)  # 'trivia' or 'personality'
    created_by = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())
    
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
    user_id = Column(Integer)
    score = Column(Integer)
    personality = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    quiz = relationship("Quiz", back_populates="results")


class PersonalityContent(Base):
    __tablename__ = "personality_content"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    personality = Column(Text, nullable=False)
    quote = Column(Text)
    gif_url = Column(Text)
    joke = Column(Text)


class DailyJoke(Base):
    __tablename__ = "daily_jokes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False, unique=True)  # YYYY-MM-DD
    joke = Column(Text, nullable=False)
    source = Column(String, nullable=False)  # 'openai' | 'fallback'
    created_at = Column(DateTime, server_default=func.now())


class JokeSuggestion(Base):
    __tablename__ = "joke_suggestions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    suggestion_text = Column(Text, nullable=False)
    user_id = Column(Integer)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
