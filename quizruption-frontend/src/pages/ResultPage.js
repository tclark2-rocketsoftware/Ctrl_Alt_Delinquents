// Result page
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResult } from '../services/api';
import QuizResult from '../components/QuizResult';

function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await getResult(id);
        setResult(data);
        setError(null);
      } catch (err) {
        setError('Failed to load result');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) return <div className="loading">Loading result...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!result) return <div className="error">Result not found</div>;

  return (
    <div className="result-page">
      <QuizResult result={result} />
      
      <div className="result-actions">
        <Link to="/" className="btn-primary">
          Take Another Quiz
        </Link>
      </div>
    </div>
  );
}

export default ResultPage;
