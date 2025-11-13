# Unit tests for result service layer with mocking
import pytest
from unittest.mock import Mock, MagicMock, patch
from sqlalchemy.orm import Session
from app.services import result_service
from app import models


class TestCalculateScore:
    """Unit tests for calculate_score function"""
    
    def test_calculate_score_all_correct(self):
        """Test score calculation with all correct answers"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        # Mock quiz with 3 questions
        mock_questions = [
            Mock(id=1, answers=[
                Mock(id=1, is_correct=False),
                Mock(id=2, is_correct=True)
            ]),
            Mock(id=2, answers=[
                Mock(id=3, is_correct=True),
                Mock(id=4, is_correct=False)
            ]),
            Mock(id=3, answers=[
                Mock(id=5, is_correct=True),
                Mock(id=6, is_correct=False)
            ])
        ]
        
        # User selected all correct answers
        user_answers = [2, 3, 5]
        
        # Act
        score = result_service.calculate_score(mock_questions, user_answers)
        
        # Assert
        assert score == 3  # All correct
    
    def test_calculate_score_all_wrong(self):
        """Test score calculation with all wrong answers"""
        # Arrange
        mock_questions = [
            Mock(id=1, answers=[
                Mock(id=1, is_correct=False),
                Mock(id=2, is_correct=True)
            ]),
            Mock(id=2, answers=[
                Mock(id=3, is_correct=True),
                Mock(id=4, is_correct=False)
            ])
        ]
        
        # User selected all wrong answers
        user_answers = [1, 4]
        
        # Act
        score = result_service.calculate_score(mock_questions, user_answers)
        
        # Assert
        assert score == 0  # All wrong
    
    def test_calculate_score_partial(self):
        """Test score calculation with partial correct answers"""
        # Arrange
        mock_questions = [
            Mock(id=1, answers=[
                Mock(id=1, is_correct=True),
                Mock(id=2, is_correct=False)
            ]),
            Mock(id=2, answers=[
                Mock(id=3, is_correct=False),
                Mock(id=4, is_correct=True)
            ]),
            Mock(id=3, answers=[
                Mock(id=5, is_correct=True),
                Mock(id=6, is_correct=False)
            ])
        ]
        
        # User got 2 out of 3 correct
        user_answers = [1, 3, 5]  # Correct, Wrong, Correct
        
        # Act
        score = result_service.calculate_score(mock_questions, user_answers)
        
        # Assert
        assert score == 2
    
    def test_calculate_score_empty_answers(self):
        """Test score calculation with no answers provided"""
        # Arrange
        mock_questions = [
            Mock(id=1, answers=[Mock(id=1, is_correct=True)])
        ]
        
        user_answers = []
        
        # Act
        score = result_service.calculate_score(mock_questions, user_answers)
        
        # Assert
        assert score == 0
    
    def test_calculate_score_empty_quiz(self):
        """Test score calculation with quiz that has no questions"""
        # Arrange
        mock_questions = []
        user_answers = []
        
        # Act
        score = result_service.calculate_score(mock_questions, user_answers)
        
        # Assert
        assert score == 0


class TestCalculatePersonality:
    """Unit tests for calculate_personality function"""
    
    def test_calculate_personality_single_dominant(self):
        """Test personality calculation with one dominant trait"""
        # Arrange
        user_answers_data = [
            Mock(personality_tag="introvert"),
            Mock(personality_tag="introvert"),
            Mock(personality_tag="extrovert")
        ]
        
        # Act
        personality = result_service.calculate_personality(user_answers_data)
        
        # Assert
        assert personality == "introvert"  # Most common
    
    def test_calculate_personality_tie(self):
        """Test personality calculation with tied traits"""
        # Arrange
        user_answers_data = [
            Mock(personality_tag="type_a"),
            Mock(personality_tag="type_b")
        ]
        
        # Act
        personality = result_service.calculate_personality(user_answers_data)
        
        # Assert
        # Should return one of the tied traits
        assert personality in ["type_a", "type_b"]
    
    def test_calculate_personality_no_tags(self):
        """Test personality calculation when no tags present"""
        # Arrange
        user_answers_data = [
            Mock(personality_tag=None),
            Mock(personality_tag=None)
        ]
        
        # Act
        personality = result_service.calculate_personality(user_answers_data)
        
        # Assert
        assert personality is None or personality == ""
    
    def test_calculate_personality_mixed_tags_and_none(self):
        """Test personality calculation with mix of tags and None"""
        # Arrange
        user_answers_data = [
            Mock(personality_tag="leader"),
            Mock(personality_tag=None),
            Mock(personality_tag="leader"),
            Mock(personality_tag="follower")
        ]
        
        # Act
        personality = result_service.calculate_personality(user_answers_data)
        
        # Assert
        assert personality == "leader"  # Most common non-None
    
    def test_calculate_personality_empty_answers(self):
        """Test personality calculation with empty answer list"""
        # Arrange
        user_answers_data = []
        
        # Act
        personality = result_service.calculate_personality(user_answers_data)
        
        # Assert
        assert personality is None or personality == ""
    
    def test_calculate_personality_case_sensitivity(self):
        """Test that personality tags are case-sensitive or normalized"""
        # Arrange
        user_answers_data = [
            Mock(personality_tag="Introvert"),
            Mock(personality_tag="introvert"),
            Mock(personality_tag="INTROVERT")
        ]
        
        # Act
        personality = result_service.calculate_personality(user_answers_data)
        
        # Assert
        # Should handle case (implementation dependent)
        assert personality is not None


class TestCreateResult:
    """Unit tests for create_result function"""
    
    def test_create_result_trivia_quiz(self):
        """Test creating result for trivia quiz"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        quiz_id = 1
        user_id = 10
        score = 8
        total = 10
        
        # Act
        result = result_service.create_result(
            mock_db,
            quiz_id=quiz_id,
            user_id=user_id,
            score=score,
            total=total,
            personality=None
        )
        
        # Assert
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
    
    def test_create_result_personality_quiz(self):
        """Test creating result for personality quiz"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        # Act
        result = result_service.create_result(
            mock_db,
            quiz_id=1,
            user_id=10,
            score=None,
            total=None,
            personality="introvert"
        )
        
        # Assert
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
    
    def test_create_result_perfect_score(self):
        """Test creating result with perfect score"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        # Act
        result = result_service.create_result(
            mock_db,
            quiz_id=1,
            user_id=10,
            score=10,
            total=10,
            personality=None
        )
        
        # Assert
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
    
    def test_create_result_zero_score(self):
        """Test creating result with zero score"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        # Act
        result = result_service.create_result(
            mock_db,
            quiz_id=1,
            user_id=10,
            score=0,
            total=10,
            personality=None
        )
        
        # Assert
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()


class TestGetResultById:
    """Unit tests for get_result_by_id function"""
    
    def test_get_result_exists(self):
        """Test getting result that exists"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        
        mock_result = Mock(id=1, quiz_id=1, score=8)
        mock_query.filter.return_value.first.return_value = mock_result
        
        # Act
        result = result_service.get_result_by_id(mock_db, result_id=1)
        
        # Assert
        assert result is not None
        assert result.id == 1
    
    def test_get_result_not_exists(self):
        """Test getting result that doesn't exist"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        
        # Act
        result = result_service.get_result_by_id(mock_db, result_id=999)
        
        # Assert
        assert result is None


class TestResultServiceEdgeCases:
    """Edge case tests for result service"""
    
    def test_calculate_score_invalid_answer_ids(self):
        """Test score calculation with answer IDs that don't exist"""
        # Arrange
        mock_questions = [
            Mock(id=1, answers=[
                Mock(id=1, is_correct=True),
                Mock(id=2, is_correct=False)
            ])
        ]
        
        # User provided invalid answer IDs
        user_answers = [999, 888]
        
        # Act
        score = result_service.calculate_score(mock_questions, user_answers)
        
        # Assert
        # Should handle gracefully, return 0
        assert score == 0
    
    def test_calculate_score_duplicate_answers(self):
        """Test score calculation when user submits duplicate answers"""
        # Arrange
        mock_questions = [
            Mock(id=1, answers=[
                Mock(id=1, is_correct=True),
                Mock(id=2, is_correct=False)
            ])
        ]
        
        # User submitted same answer twice
        user_answers = [1, 1]
        
        # Act
        score = result_service.calculate_score(mock_questions, user_answers)
        
        # Assert
        # Should handle gracefully (implementation dependent)
        assert isinstance(score, int)
        assert score >= 0
    
    def test_calculate_personality_with_empty_strings(self):
        """Test personality calculation with empty string tags"""
        # Arrange
        user_answers_data = [
            Mock(personality_tag=""),
            Mock(personality_tag="valid_tag"),
            Mock(personality_tag="")
        ]
        
        # Act
        personality = result_service.calculate_personality(user_answers_data)
        
        # Assert
        # Should ignore empty strings and return valid tag
        assert personality == "valid_tag" or personality == ""
    
    def test_create_result_negative_score(self):
        """Test creating result with negative score (edge case)"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        # Act - Negative score shouldn't happen but test handling
        result = result_service.create_result(
            mock_db,
            quiz_id=1,
            user_id=10,
            score=-5,
            total=10,
            personality=None
        )
        
        # Assert - Should still save (validation elsewhere)
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
    
    def test_create_result_score_exceeds_total(self):
        """Test creating result where score > total (edge case)"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        # Act - Score exceeds total (shouldn't happen but test handling)
        result = result_service.create_result(
            mock_db,
            quiz_id=1,
            user_id=10,
            score=15,
            total=10,
            personality=None
        )
        
        # Assert - Should still save
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
