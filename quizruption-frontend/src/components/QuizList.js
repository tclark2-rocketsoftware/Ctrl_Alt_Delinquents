// Display all quizzes
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes, deleteQuiz } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function QuizList({ filter, limit, showTitle = true, type, title }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizzes(filter);
        
        // Filter by type if specified
        let filteredData = data;
        if (type) {
          filteredData = data.filter(quiz => quiz.type === type);
        }
        
        // Limit the number of quizzes shown if limit is provided
        const limitedData = limit ? filteredData.slice(0, limit) : filteredData;
        setQuizzes(limitedData);
        setError(null);
      } catch (err) {
        setError('Failed to load quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [filter, limit, type]);

  const handleDelete = async (quizId, quizTitle) => {
    if (window.confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
      try {
        await deleteQuiz(quizId);
        // Refresh the quiz list
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      } catch (error) {
        alert('Error deleting quiz: ' + error.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading quizzes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quiz-list">
      {showTitle && (
        <h2 className="section-title">
          {title || (type === 'trivia' ? '🧠 Recently Created Trivia' : type === 'personality' ? '🌟 Recently Created Quizzes' : '🎯 Recently Created Content')}
        </h2>
      )}
      {quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">{type === 'trivia' ? '🧠' : '🎯'}</div>
            <h3>
              {type === 'trivia' ? 'No Trivia Yet!' : type === 'personality' ? 'No Quizzes Yet!' : 'No Quizzes Yet!'}
            </h3>
            <p>
              {type === 'trivia' 
                ? 'Be the first to create a trivia quiz and test knowledge!' 
                : type === 'personality'
                ? 'Be the first to create a personality quiz and share it with the community.'
                : 'Be the first to create a quiz and share it with the community.'}
            </p>
            <div className="empty-actions">
              <Link to="/create" className="btn-primary">
                ✨ {type === 'trivia' ? 'Create Your First Trivia' : 'Create Your First Quiz'}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div className="quiz-meta">
                <span className="quiz-type">{quiz.type}</span>
                <span className="quiz-questions">
                  {quiz.questions?.length || 0} questions
                </span>
              </div>
              
              {/* Creator Information */}
              {quiz.creator && (
                <div className="quiz-creator">
                  <div className="creator-avatar">
                    {quiz.creator.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="creator-info">
                    <div className="creator-name">
                      Created by <strong>{quiz.creator.username}</strong>
                    </div>
                    <div className="creator-date">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="quiz-actions">
                <Link to={`/quiz/${quiz.id}`} className="btn-primary">
                  🚀 Start {quiz.type === 'trivia' ? 'Trivia' : 'Quiz'}
                </Link>
                <Link to={`/quiz/${quiz.id}/details`} className="btn-secondary">
                  📖 Details
                </Link>
                {user && quiz.created_by === user.id && (
                  <div className="creator-actions">
                    <Link to={`/edit/${quiz.id}`} className="btn-edit">
                      ✏️ Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(quiz.id, quiz.title)}
                      className="btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {limit && quizzes.length >= limit && (
            <div className="view-more">
              <Link to="/quiz" className="btn-outline">View All Quizzes →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizList;