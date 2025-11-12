# Test cases for answer submission
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_submit_trivia_quiz():
    """Test submitting answers to a trivia quiz"""
    # First create a quiz
    quiz_data = {
        "title": "Math Quiz",
        "description": "Test your math skills",
        "type": "trivia",
        "questions": [
            {
                "text": "What is 5+5?",
                "answers": [
                    {"text": "9", "is_correct": False},
                    {"text": "10", "is_correct": True}
                ]
            }
        ]
    }
    
    create_response = client.post("/api/quizzes/", json=quiz_data)
    quiz_id = create_response.json()["id"]
    answer_id = create_response.json()["questions"][0]["answers"][1]["id"]
    
    # Submit answers
    submission = {
        "quiz_id": quiz_id,
        "user_id": 1,
        "answers": [answer_id]
    }
    
    response = client.post("/api/answers/submit", json=submission)
    assert response.status_code == 200
    assert response.json()["score"] == 1


def test_submit_personality_quiz():
    """Test submitting answers to a personality quiz"""
    quiz_data = {
        "title": "Personality Test",
        "description": "What's your personality?",
        "type": "personality",
        "questions": [
            {
                "text": "Choose your style",
                "answers": [
                    {"text": "Bold", "personality_tag": "leader"},
                    {"text": "Calm", "personality_tag": "thinker"}
                ]
            }
        ]
    }
    
    create_response = client.post("/api/quizzes/", json=quiz_data)
    quiz_id = create_response.json()["id"]
    answer_id = create_response.json()["questions"][0]["answers"][0]["id"]
    
    submission = {
        "quiz_id": quiz_id,
        "answers": [answer_id]
    }
    
    response = client.post("/api/answers/submit", json=submission)
    assert response.status_code == 200
    assert response.json()["personality"] == "leader"
