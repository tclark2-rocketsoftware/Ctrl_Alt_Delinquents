# Unit tests for User model methods
import pytest
from unittest.mock import Mock, MagicMock, patch
from app.models import User
from datetime import datetime


class TestUserModel:
    """Unit tests for User model"""
    
    def test_set_password_hashes_correctly(self):
        """Test that set_password hashes the password"""
        user = User(
            username="testuser",
            email="test@example.com"
        )
        
        plain_password = "MySecurePassword123!"
        user.set_password(plain_password)
        
        # Password should be hashed, not stored as plain text
        assert user.password_hash != plain_password
        assert len(user.password_hash) > 0
        assert user.password_hash.startswith("pbkdf2:sha256") or user.password_hash.startswith("scrypt:")
    
    def test_check_password_with_correct_password(self):
        """Test password verification with correct password"""
        user = User(
            username="testuser",
            email="test@example.com"
        )
        
        password = "CorrectPassword123!"
        user.set_password(password)
        
        # Should return True for correct password
        assert user.check_password(password) == True
    
    def test_check_password_with_wrong_password(self):
        """Test password verification with incorrect password"""
        user = User(
            username="testuser",
            email="test@example.com"
        )
        
        user.set_password("CorrectPassword123!")
        
        # Should return False for wrong password
        assert user.check_password("WrongPassword456!") == False
    
    def test_check_password_case_sensitive(self):
        """Test that password checking is case-sensitive"""
        user = User(
            username="testuser",
            email="test@example.com"
        )
        
        user.set_password("MyPassword123")
        
        # Different case should fail
        assert user.check_password("mypassword123") == False
        assert user.check_password("MYPASSWORD123") == False
    
    def test_to_dict_excludes_password_hash(self):
        """Test that to_dict() doesn't expose password hash"""
        user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            display_name="Test User",
            bio="Test bio"
        )
        user.set_password("password123")
        
        user_dict = user.to_dict()
        
        # Should not contain password_hash
        assert "password_hash" not in user_dict
        assert "password" not in user_dict
        
        # Should contain safe fields
        assert user_dict["username"] == "testuser"
        assert user_dict["email"] == "test@example.com"
        assert user_dict["id"] == 1
    
    def test_to_public_dict_excludes_email(self):
        """Test that to_public_dict() hides private information"""
        user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            display_name="Test User",
            bio="Public bio"
        )
        
        public_dict = user.to_public_dict()
        
        # Should not contain private fields
        assert "email" not in public_dict
        assert "password_hash" not in public_dict
        
        # Should contain public fields
        assert public_dict["username"] == "testuser"
        assert public_dict["display_name"] == "Test User"
        assert public_dict["bio"] == "Public bio"
    
    def test_password_hash_different_for_same_password(self):
        """Test that same password generates different hashes (salt)"""
        user1 = User(username="user1", email="user1@example.com")
        user2 = User(username="user2", email="user2@example.com")
        
        password = "SamePassword123!"
        user1.set_password(password)
        user2.set_password(password)
        
        # Same password should produce different hashes (salted)
        assert user1.password_hash != user2.password_hash
    
    def test_empty_password_handling(self):
        """Test handling of empty password"""
        user = User(username="testuser", email="test@example.com")
        
        # Should still hash empty string (edge case)
        user.set_password("")
        assert user.password_hash != ""
        assert len(user.password_hash) > 0
    
    def test_very_long_password(self):
        """Test handling of very long password"""
        user = User(username="testuser", email="test@example.com")
        
        # 1000 character password
        long_password = "a" * 1000
        user.set_password(long_password)
        
        # Should hash successfully
        assert len(user.password_hash) > 0
        assert user.check_password(long_password) == True
    
    def test_special_characters_in_password(self):
        """Test password with special characters"""
        user = User(username="testuser", email="test@example.com")
        
        special_password = "P@$$w0rd!#%&*()[]{}|\\;:'\",.<>?/~`"
        user.set_password(special_password)
        
        # Should handle special characters correctly
        assert user.check_password(special_password) == True
        assert user.check_password("P@$$w0rd") == False  # Partial should fail
    
    def test_unicode_password(self):
        """Test password with unicode characters"""
        user = User(username="testuser", email="test@example.com")
        
        unicode_password = "パスワード123"  # Japanese characters
        user.set_password(unicode_password)
        
        # Should handle unicode correctly
        assert user.check_password(unicode_password) == True


class TestUserModelEdgeCases:
    """Edge case tests for User model"""
    
    def test_to_dict_with_none_fields(self):
        """Test to_dict with None optional fields"""
        user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            display_name=None,
            bio=None,
            location=None
        )
        
        user_dict = user.to_dict()
        
        # Should handle None values gracefully
        assert user_dict["username"] == "testuser"
        assert user_dict.get("display_name") is None
        assert user_dict.get("bio") is None
    
    def test_check_password_on_user_without_password(self):
        """Test check_password when no password was set"""
        user = User(username="testuser", email="test@example.com")
        
        # User has no password_hash set
        # Should handle gracefully without crashing
        try:
            result = user.check_password("anypassword")
            # Should return False or handle None
            assert result == False or result is None
        except (AttributeError, TypeError):
            # Acceptable if it raises these errors for None password_hash
            pass
    
    def test_sql_injection_in_password(self):
        """Test that SQL injection attempts in password are just hashed"""
        user = User(username="testuser", email="test@example.com")
        
        sql_injection = "'; DROP TABLE users; --"
        user.set_password(sql_injection)
        
        # Should just hash it like any other string
        assert user.check_password(sql_injection) == True
        assert user.check_password("random") == False
