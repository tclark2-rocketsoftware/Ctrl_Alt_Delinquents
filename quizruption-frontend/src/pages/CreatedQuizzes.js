// Display all quizzes created by the user
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserStats, deleteQuiz } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CreatedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreatedQuizzes = async () => {
      try {
        setLoading(true);
        const userStats = await getUserStats(user.id);
        setQuizzes(userStats.quizzes_created || []);
        setError(null);
      } catch (err) {
        setError('Failed to load your created quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCreatedQuizzes();
    }
  }, [user]);

  const handleDelete = async (quizId, quizTitle) => {
    if (window.confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
      try {
        await deleteQuiz(quizId);
        // Remove from local state
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      } catch (error) {
        alert('Error deleting quiz: ' + error.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading your created content...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="created-quizzes-page">
      <div className="page-header">
        <h1>📝 Your Created Content</h1>
        <p>Manage all the quizzes and trivia you've created</p>
        <div className="header-actions">
          <Link to="/create" className="btn-primary create-new-btn">
            ✨ Create New Quiz
          </Link>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">📝</div>
            <h3>No Content Created Yet!</h3>
            <p>Start creating quizzes and trivia to see them here.</p>
            <div className="empty-actions">
              <Link to="/create" className="btn-primary">✨ Create Your First Quiz</Link>
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
                <span className={`quiz-type ${quiz.type}`}>
                  {quiz.type === 'trivia' ? '🧠 Trivia' : '🌟 Quiz'}
                </span>
                <span className="quiz-questions">
                  {quiz.questions?.length || 0} questions
                </span>
                <span className="quiz-date">
                  Created {new Date(quiz.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="quiz-actions">
                <Link to={`/quiz/${quiz.id}`} className="btn-primary">
                  🚀 Test {quiz.type === 'trivia' ? 'Trivia' : 'Quiz'}
                </Link>
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
            </div>
          ))}
        </div>
      )}
      
      <div className="page-footer">
        <button onClick={() => navigate(-1)} className="btn-back-centered">
          ← Back to Profile
        </button>
      </div>
    </div>
  );
}

export default CreatedQuizzes;