// Display trivia quizzes
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes } from '../services/api';

function TriviaList({ limit = 5 }) {
  const [triviaQuizzes, setTriviaQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTriviaQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizzes('trivia');
        // Limit the number of trivia items shown
        setTriviaQuizzes(data.slice(0, limit));
        setError(null);
      } catch (err) {
        setError('Failed to load trivia');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTriviaQuizzes();
  }, [limit]);

  if (loading) return <div className="loading">Loading trivia...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="trivia-list">
      <h2 className="section-title">🧠 Recently Created Trivia</h2>
      {triviaQuizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">🧠</div>
            <h3>No Trivia Yet!</h3>
            <p>Be the first to create trivia questions and challenge others.</p>
            <div className="empty-actions">
              <Link to="/create" className="btn-primary">✨ Create Some Trivia</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-grid">
          {triviaQuizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card trivia-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div className="quiz-meta">
                <span className="quiz-type">🧠 Trivia</span>
                <span className="quiz-questions">{quiz.question_count || 0} questions</span>
              </div>
              <div className="quiz-actions">
                <Link to={`/quiz/${quiz.id}`} className="btn-primary quiz-btn">
                  Start Quiz
                </Link>
              </div>
            </div>
          ))}
          {triviaQuizzes.length >= limit && (
            <div className="view-more">
              <Link to="/trivia" className="btn-outline">View All Trivia →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TriviaList;