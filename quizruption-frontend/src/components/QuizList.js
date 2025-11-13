// Display all quizzes
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes } from '../services/api';

function QuizList({ filter, limit, showTitle = true }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizzes(filter);
        // Limit the number of quizzes shown if limit is provided
        const limitedData = limit ? data.slice(0, limit) : data;
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
  }, [filter, limit]);

  if (loading) return <div className="loading">Loading quizzes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quiz-list">
      {showTitle && <h2 className="section-title">🌟 Recently Created Quizzes</h2>}
      {quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">🎯</div>
            <h3>No Quizzes Yet!</h3>
            <p>Be the first to create a quiz and share it with the community.</p>
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
                  🚀 Start Quiz
                </Link>
                <Link to={`/quiz/${quiz.id}/details`} className="btn-secondary">
                  📖 Details
                </Link>
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