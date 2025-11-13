# Unit tests for quiz service layer with mocking
import pytest
from unittest.mock import Mock, MagicMock, patch, call
from sqlalchemy.orm import Session
from app.services import quiz_service
from app import models, schemas


class TestCreateQuiz:
    """Unit tests for create_quiz function"""
    
    def test_create_quiz_basic_flow(self):
        """Test basic quiz creation flow with mocked database"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        quiz_data = schemas.QuizCreate(
            title="Test Quiz",
            description="A test quiz",
            type="trivia",
            created_by=1,
            questions=[
                schemas.QuestionCreate(
                    text="What is 2+2?",
                    answers=[
                        schemas.AnswerCreate(text="3", is_correct=False),
                        schemas.AnswerCreate(text="4", is_correct=True)
                    ]
                )
            ]
        )
        
        # Act
        result = quiz_service.create_quiz(mock_db, quiz_data)
        
        # Assert
        # Should call db.add for quiz
        assert mock_db.add.called
        # Should call db.flush at least once
        assert mock_db.flush.called
        # Should call db.commit once
        mock_db.commit.assert_called_once()
        # Should call db.refresh
        assert mock_db.refresh.called
    
    def test_create_quiz_adds_all_questions(self):
        """Test that all questions are added to database"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        quiz_data = schemas.QuizCreate(
            title="Multi Question Quiz",
            description="Test",
            type="trivia",
            created_by=1,
            questions=[
                schemas.QuestionCreate(
                    text="Question 1",
                    answers=[schemas.AnswerCreate(text="A1", is_correct=True)]
                ),
                schemas.QuestionCreate(
                    text="Question 2",
                    answers=[schemas.AnswerCreate(text="A2", is_correct=True)]
                ),
                schemas.QuestionCreate(
                    text="Question 3",
                    answers=[schemas.AnswerCreate(text="A3", is_correct=True)]
                )
            ]
        )
        
        # Act
        quiz_service.create_quiz(mock_db, quiz_data)
        
        # Assert
        # db.add should be called for: 1 quiz + 3 questions + 3 answers = 7 times
        assert mock_db.add.call_count >= 4  # At minimum: quiz + 3 questions
    
    def test_create_quiz_with_no_questions(self):
        """Test creating quiz with empty questions list"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        quiz_data = schemas.QuizCreate(
            title="Empty Quiz",
            description="No questions",
            type="trivia",
            created_by=1,
            questions=[]
        )
        
        # Act
        result = quiz_service.create_quiz(mock_db, quiz_data)
        
        # Assert
        # Should still create the quiz even with no questions
        mock_db.add.assert_called()
        mock_db.commit.assert_called_once()
    
    def test_create_quiz_with_personality_type(self):
        """Test creating personality quiz with personality tags"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        quiz_data = schemas.QuizCreate(
            title="Personality Quiz",
            description="What's your type?",
            type="personality",
            created_by=1,
            questions=[
                schemas.QuestionCreate(
                    text="How do you relax?",
                    answers=[
                        schemas.AnswerCreate(
                            text="Read a book",
                            is_correct=False,
                            personality_tag="introvert"
                        ),
                        schemas.AnswerCreate(
                            text="Party with friends",
                            is_correct=False,
                            personality_tag="extrovert"
                        )
                    ]
                )
            ]
        )
        
        # Act
        result = quiz_service.create_quiz(mock_db, quiz_data)
        
        # Assert
        assert mock_db.add.called
        assert mock_db.commit.called


class TestGetQuizzes:
    """Unit tests for get_quizzes function"""
    
    def test_get_quizzes_returns_all(self):
        """Test getting all quizzes without filter"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        
        mock_quizzes = [
            Mock(id=1, title="Quiz 1", type="trivia"),
            Mock(id=2, title="Quiz 2", type="personality")
        ]
        mock_query.all.return_value = mock_quizzes
        
        # Act
        result = quiz_service.get_quizzes(mock_db)
        
        # Assert
        mock_db.query.assert_called_with(models.Quiz)
        mock_query.all.assert_called_once()
        assert len(result) == 2
    
    def test_get_quizzes_with_type_filter(self):
        """Test filtering quizzes by type"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        
        mock_quizzes = [Mock(id=1, title="Quiz 1", type="trivia")]
        mock_query.all.return_value = mock_quizzes
        
        # Act
        result = quiz_service.get_quizzes(mock_db, quiz_type="trivia")
        
        # Assert
        mock_query.filter.assert_called_once()
        mock_query.all.assert_called_once()
    
    def test_get_quizzes_returns_empty_list(self):
        """Test getting quizzes when database is empty"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.all.return_value = []
        
        # Act
        result = quiz_service.get_quizzes(mock_db)
        
        # Assert
        assert result == []
        assert isinstance(result, list)


class TestGetQuizById:
    """Unit tests for get_quiz function"""
    
    def test_get_quiz_by_id_exists(self):
        """Test getting quiz that exists"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        
        mock_quiz = Mock(id=1, title="Test Quiz")
        mock_query.options.return_value.filter.return_value.first.return_value = mock_quiz
        
        # Act
        result = quiz_service.get_quiz(mock_db, quiz_id=1)
        
        # Assert
        assert result is not None
        assert result.id == 1
        mock_db.query.assert_called_with(models.Quiz)
    
    def test_get_quiz_by_id_not_exists(self):
        """Test getting quiz that doesn't exist"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.options.return_value.filter.return_value.first.return_value = None
        
        # Act
        result = quiz_service.get_quiz(mock_db, quiz_id=999)
        
        # Assert
        assert result is None
    
    def test_get_quiz_negative_id(self):
        """Test getting quiz with negative ID"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.options.return_value.filter.return_value.first.return_value = None
        
        # Act
        result = quiz_service.get_quiz(mock_db, quiz_id=-1)
        
        # Assert
        assert result is None


class TestDeleteQuiz:
    """Unit tests for delete_quiz function"""
    
    def test_delete_quiz_success(self):
        """Test successful quiz deletion"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        
        mock_quiz = Mock(id=1, title="Quiz to delete")
        mock_query.filter.return_value.first.return_value = mock_quiz
        
        # Act
        result = quiz_service.delete_quiz(mock_db, quiz_id=1)
        
        # Assert
        mock_db.delete.assert_called_once_with(mock_quiz)
        mock_db.commit.assert_called_once()
        assert result == True
    
    def test_delete_quiz_not_found(self):
        """Test deleting non-existent quiz"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None
        
        # Act
        result = quiz_service.delete_quiz(mock_db, quiz_id=999)
        
        # Assert
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()
        assert result == False


class TestUpdateQuiz:
    """Unit tests for update_quiz function"""
    
    def test_update_quiz_title(self):
        """Test updating quiz title"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_quiz = Mock(id=1, title="Old Title", description="Desc")
        
        update_data = schemas.QuizUpdate(title="New Title")
        
        # Mock the query chain
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = mock_quiz
        
        # Act
        result = quiz_service.update_quiz(mock_db, quiz_id=1, quiz_update=update_data)
        
        # Assert
        assert mock_quiz.title == "New Title"
        mock_db.commit.assert_called_once()


class TestQuizServiceEdgeCases:
    """Edge case tests for quiz service"""
    
    def test_create_quiz_with_very_long_title(self):
        """Test creating quiz with extremely long title"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        long_title = "A" * 10000  # 10,000 character title
        quiz_data = schemas.QuizCreate(
            title=long_title,
            description="Test",
            type="trivia",
            created_by=1,
            questions=[]
        )
        
        # Act
        result = quiz_service.create_quiz(mock_db, quiz_data)
        
        # Assert
        mock_db.add.assert_called()
        mock_db.commit.assert_called()
    
    def test_create_quiz_with_special_characters(self):
        """Test quiz with special characters in title"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        
        quiz_data = schemas.QuizCreate(
            title="Test<script>alert('xss')</script>",
            description="SQL'; DROP TABLE quizzes; --",
            type="trivia",
            created_by=1,
            questions=[]
        )
        
        # Act
        result = quiz_service.create_quiz(mock_db, quiz_data)
        
        # Assert - Should handle without error
        mock_db.add.assert_called()
        mock_db.commit.assert_called()
    
    def test_get_quiz_with_zero_id(self):
        """Test getting quiz with ID of 0"""
        # Arrange
        mock_db = MagicMock(spec=Session)
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.options.return_value.filter.return_value.first.return_value = None
        
        # Act
        result = quiz_service.get_quiz(mock_db, quiz_id=0)
        
        # Assert
        assert result is None
