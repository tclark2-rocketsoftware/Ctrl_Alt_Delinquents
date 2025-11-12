// Quiz page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../services/api';
import QuizDetail from '../components/QuizDetail';

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await getQuiz(id);
        setQuiz(data);
        setError(null);
      } catch (err) {
        setError('Failed to load quiz');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleSubmit = async (answers) => {
    try {
      const result = await submitQuiz({
        quiz_id: parseInt(id),
        answers: answers
      });
      
      navigate(`/result/${result.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!quiz) return <div className="error">Quiz not found</div>;

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <p>{quiz.description}</p>
      </div>
      
      <QuizDetail quiz={quiz} onSubmit={handleSubmit} />
    </div>
  );
}

export default QuizPage;
