import requests
import json

# Test registration
url = "http://localhost:8000/api/auth/register"
data = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
    print(f"Response text: {response.text}")
