# Test cases for quiz endpoints
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_create_quiz():
    """Test creating a new quiz"""
    quiz_data = {
        "title": "Test Trivia Quiz",
        "description": "A test quiz",
        "type": "trivia",
        "questions": [
            {
                "text": "What is 2+2?",
                "answers": [
                    {"text": "3", "is_correct": False},
                    {"text": "4", "is_correct": True}
                ]
            }
        ]
    }
    
    response = client.post("/api/quizzes/", json=quiz_data)
    assert response.status_code == 201
    assert response.json()["title"] == "Test Trivia Quiz"


def test_get_quizzes():
    """Test retrieving all quizzes"""
    response = client.get("/api/quizzes/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_quiz_by_id():
    """Test retrieving a specific quiz"""
    # First create a quiz
    quiz_data = {
        "title": "Test Quiz 2",
        "description": "Another test",
        "type": "personality",
        "questions": [
            {
                "text": "How do you feel?",
                "answers": [
                    {"text": "Happy", "personality_tag": "optimist"},
                    {"text": "Sad", "personality_tag": "realist"}
                ]
            }
        ]
    }
    
    create_response = client.post("/api/quizzes/", json=quiz_data)
    quiz_id = create_response.json()["id"]
    
    # Get the quiz
    response = client.get(f"/api/quizzes/{quiz_id}")
    assert response.status_code == 200
    assert response.json()["id"] == quiz_id
