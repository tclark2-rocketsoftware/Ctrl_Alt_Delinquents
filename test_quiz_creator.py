#!/usr/bin/env python3
"""
Test script to create sample quizzes with creator information
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_quiz_creation_with_creator():
    print("🧪 Testing Quiz Creation with Creator Information")
    print("=" * 60)
    
    try:
        # First, register a user to be the creator
        user_data = {
            "username": "quizmaster",
            "email": "quiz@example.com",
            "password": "testpass123"
        }
        
        print("\n👤 Creating test user...")
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        
        if register_response.status_code == 200:
            token_data = register_response.json()
            print(f"✅ User created: {token_data['user']['username']}")
            user_id = token_data['user']['id']
            
            # Create a sample quiz
            quiz_data = {
                "title": "What's Your Learning Style?",
                "description": "Discover whether you're a visual, auditory, or kinesthetic learner",
                "type": "personality",
                "created_by": user_id,
                "questions": [
                    {
                        "text": "How do you prefer to receive instructions?",
                        "answers": [
                            {"text": "Written step-by-step guide", "is_correct": False, "personality_tag": "visual"},
                            {"text": "Verbal explanation", "is_correct": False, "personality_tag": "auditory"},
                            {"text": "Hands-on demonstration", "is_correct": False, "personality_tag": "kinesthetic"},
                            {"text": "Video tutorial", "is_correct": False, "personality_tag": "visual"}
                        ]
                    },
                    {
                        "text": "When studying, you work best:",
                        "answers": [
                            {"text": "In complete silence", "is_correct": False, "personality_tag": "visual"},
                            {"text": "With background music", "is_correct": False, "personality_tag": "auditory"},
                            {"text": "While walking around", "is_correct": False, "personality_tag": "kinesthetic"},
                            {"text": "With organized notes", "is_correct": False, "personality_tag": "visual"}
                        ]
                    }
                ]
            }
            
            print("\n📝 Creating sample quiz...")
            quiz_response = requests.post(f"{BASE_URL}/api/quizzes/", json=quiz_data)
            
            if quiz_response.status_code == 201:
                quiz = quiz_response.json()
                print(f"✅ Quiz created: '{quiz['title']}'")
                print(f"   Quiz ID: {quiz['id']}")
                print(f"   Created by: {quiz['created_by']}")
                
                # Test retrieving the quiz with creator information
                print("\n🔍 Retrieving quiz with creator info...")
                get_response = requests.get(f"{BASE_URL}/api/quizzes/{quiz['id']}")
                
                if get_response.status_code == 200:
                    detailed_quiz = get_response.json()
                    print("✅ Quiz retrieved successfully!")
                    print(f"   Title: {detailed_quiz['title']}")
                    print(f"   Creator ID: {detailed_quiz.get('created_by', 'None')}")
                    
                    if 'creator' in detailed_quiz and detailed_quiz['creator']:
                        creator = detailed_quiz['creator']
                        print(f"   Creator Info:")
                        print(f"     - Username: {creator['username']}")
                        print(f"     - ID: {creator['id']}")
                        print(f"     - Joined: {creator['created_at']}")
                        print("🎉 Creator information successfully included!")
                    else:
                        print("❌ Creator information not included in response")
                        
                    return detailed_quiz
                else:
                    print(f"❌ Failed to retrieve quiz: {get_response.status_code}")
                    
            else:
                print(f"❌ Failed to create quiz: {quiz_response.status_code} - {quiz_response.text}")
                
        else:
            print(f"❌ Failed to create user: {register_response.status_code} - {register_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the backend server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Test Error: {e}")

if __name__ == "__main__":
    test_quiz_creation_with_creator()