// Display all quizzes
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes } from '../services/api';

function QuizList({ filter }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizzes(filter);
        setQuizzes(data);
        setError(null);
      } catch (err) {
        setError('Failed to load quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [filter]);

  if (loading) return <div className="loading">Loading quizzes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quiz-list">
      {quizzes.length === 0 ? (
        <p>No quizzes available</p>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <span className="quiz-type">{quiz.type}</span>
              <Link to={`/quiz/${quiz.id}`} className="btn-primary">
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizList;
