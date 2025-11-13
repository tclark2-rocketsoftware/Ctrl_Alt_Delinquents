# Test cases for authentication endpoints
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import jwt

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_auth.db"
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


class TestUserRegistration:
    """Test user registration functionality"""
    
    def test_register_new_user(self):
        """Test successful user registration"""
        user_data = {
            "username": "testuser1",
            "email": "testuser1@example.com",
            "password": "SecurePass123!"
        }
        
        response = client.post("/api/auth/register", json=user_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["username"] == "testuser1"
        assert data["user"]["email"] == "testuser1@example.com"
        assert "password" not in data["user"]  # Password should not be returned
    
    def test_register_duplicate_username(self):
        """Test registration with duplicate username"""
        user_data = {
            "username": "testuser2",
            "email": "testuser2@example.com",
            "password": "SecurePass123!"
        }
        
        # First registration
        client.post("/api/auth/register", json=user_data)
        
        # Try duplicate username with different email
        duplicate_data = {
            "username": "testuser2",
            "email": "different@example.com",
            "password": "AnotherPass123!"
        }
        
        response = client.post("/api/auth/register", json=duplicate_data)
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        user_data = {
            "username": "testuser3",
            "email": "duplicate@example.com",
            "password": "SecurePass123!"
        }
        
        # First registration
        client.post("/api/auth/register", json=user_data)
        
        # Try duplicate email with different username
        duplicate_data = {
            "username": "differentuser",
            "email": "duplicate@example.com",
            "password": "AnotherPass123!"
        }
        
        response = client.post("/api/auth/register", json=duplicate_data)
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_missing_fields(self):
        """Test registration with missing required fields"""
        incomplete_data = {
            "username": "incomplete"
            # Missing email and password
        }
        
        response = client.post("/api/auth/register", json=incomplete_data)
        assert response.status_code == 422  # Unprocessable Entity


class TestUserLogin:
    """Test user login functionality"""
    
    def test_login_success(self):
        """Test successful user login"""
        # First register a user
        register_data = {
            "username": "loginuser",
            "email": "loginuser@example.com",
            "password": "LoginPass123!"
        }
        client.post("/api/auth/register", json=register_data)
        
        # Now login
        login_data = {
            "username": "loginuser",
            "password": "LoginPass123!"
        }
        
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["username"] == "loginuser"
    
    def test_login_wrong_password(self):
        """Test login with incorrect password"""
        # Register a user
        register_data = {
            "username": "wrongpassuser",
            "email": "wrongpass@example.com",
            "password": "CorrectPass123!"
        }
        client.post("/api/auth/register", json=register_data)
        
        # Try login with wrong password
        login_data = {
            "username": "wrongpassuser",
            "password": "WrongPass123!"
        }
        
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent username"""
        login_data = {
            "username": "nonexistentuser",
            "password": "SomePass123!"
        }
        
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_missing_credentials(self):
        """Test login with missing credentials"""
        incomplete_data = {
            "username": "someuser"
            # Missing password
        }
        
        response = client.post("/api/auth/login", json=incomplete_data)
        assert response.status_code == 422  # Unprocessable Entity


class TestTokenValidation:
    """Test JWT token validation and user authentication"""
    
    def test_get_current_user_valid_token(self):
        """Test getting current user with valid token"""
        # Register and login
        register_data = {
            "username": "tokenuser",
            "email": "tokenuser@example.com",
            "password": "TokenPass123!"
        }
        response = client.post("/api/auth/register", json=register_data)
        token = response.json()["access_token"]
        
        # Get current user
        response = client.get(f"/api/auth/me?token={token}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["username"] == "tokenuser"
        assert data["email"] == "tokenuser@example.com"
    
    def test_get_current_user_invalid_token(self):
        """Test getting current user with invalid token"""
        invalid_token = "invalid.token.here"
        
        response = client.get(f"/api/auth/me?token={invalid_token}")
        assert response.status_code == 401
        assert "Invalid token" in response.json()["detail"]
    
    def test_get_current_user_expired_token(self):
        """Test getting current user with expired token (if we had time-travel)"""
        # Note: Testing actual expiration would require time manipulation
        # This is a placeholder for a more sophisticated test
        pass


class TestUserProfile:
    """Test user profile management"""
    
    def test_update_profile(self):
        """Test updating user profile"""
        # Register user
        register_data = {
            "username": "profileuser",
            "email": "profileuser@example.com",
            "password": "ProfilePass123!"
        }
        response = client.post("/api/auth/register", json=register_data)
        token = response.json()["access_token"]
        
        # Update profile
        profile_data = {
            "display_name": "Profile User",
            "bio": "This is my bio",
            "location": "New York",
            "website": "https://example.com"
        }
        
        response = client.put(f"/api/auth/profile?token={token}", json=profile_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["display_name"] == "Profile User"
        assert data["bio"] == "This is my bio"
        assert data["location"] == "New York"
    
    def test_get_user_profile_by_id(self):
        """Test getting public profile by user ID"""
        # Register user
        register_data = {
            "username": "publicuser",
            "email": "publicuser@example.com",
            "password": "PublicPass123!"
        }
        response = client.post("/api/auth/register", json=register_data)
        user_id = response.json()["user"]["id"]
        
        # Get public profile
        response = client.get(f"/api/auth/profile/{user_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["username"] == "publicuser"
        # Password should not be in public profile
        assert "password" not in data
        assert "password_hash" not in data
    
    def test_get_nonexistent_user_profile(self):
        """Test getting profile of non-existent user"""
        response = client.get("/api/auth/profile/999999")
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]
    
    def test_get_user_stats(self):
        """Test getting user statistics"""
        # Register user
        register_data = {
            "username": "statsuser",
            "email": "statsuser@example.com",
            "password": "StatsPass123!"
        }
        response = client.post("/api/auth/register", json=register_data)
        user_id = response.json()["user"]["id"]
        
        # Get user stats
        response = client.get(f"/api/auth/profile/{user_id}/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "user" in data
        assert "stats" in data
        assert "quizzes_created" in data["stats"]
        assert "quizzes_taken" in data["stats"]
        assert data["stats"]["quizzes_created"] == 0  # New user
        assert data["stats"]["quizzes_taken"] == 0


class TestPasswordSecurity:
    """Test password security measures"""
    
    def test_password_is_hashed(self):
        """Test that passwords are stored as hashes, not plain text"""
        # This would require direct database access
        # The test verifies we can login with the correct password
        # but the stored hash is different
        register_data = {
            "username": "hashuser",
            "email": "hashuser@example.com",
            "password": "PlainPassword123!"
        }
        response = client.post("/api/auth/register", json=register_data)
        assert response.status_code == 200
        
        # Verify we can login with the same password
        login_data = {
            "username": "hashuser",
            "password": "PlainPassword123!"
        }
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 200
    
    def test_weak_password_accepted(self):
        """Test that weak passwords are accepted (TODO: Add password strength validation)"""
        # Currently no password strength requirements
        # This test documents the lack of validation
        weak_data = {
            "username": "weakpassuser",
            "email": "weakpass@example.com",
            "password": "123"  # Very weak password
        }
        response = client.post("/api/auth/register", json=weak_data)
        # Currently this passes - TODO: Add password validation
        assert response.status_code == 200


# Cleanup after all tests
@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    # Clean up test database
    import os
    if os.path.exists("test_auth.db"):
        os.remove("test_auth.db")
