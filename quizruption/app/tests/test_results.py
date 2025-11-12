# Test cases for results
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_result():
    """Test retrieving a result by ID"""
    # Create and submit a quiz first
    quiz_data = {
        "title": "Test Quiz for Results",
        "description": "Testing results",
        "type": "trivia",
        "questions": [
            {
                "text": "Sample question?",
                "answers": [
                    {"text": "A", "is_correct": True},
                    {"text": "B", "is_correct": False}
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
    
    submit_response = client.post("/api/answers/submit", json=submission)
    result_id = submit_response.json()["id"]
    
    # Get the result
    response = client.get(f"/api/results/{result_id}")
    assert response.status_code == 200
    assert response.json()["id"] == result_id


def test_get_quiz_results():
    """Test retrieving all results for a quiz"""
    response = client.get("/api/results/quiz/1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
