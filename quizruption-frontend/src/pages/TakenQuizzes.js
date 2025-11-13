// Display all quizzes taken by the user with their results
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserStats } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function TakenQuizzes() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTakenQuizzes = async () => {
      try {
        setLoading(true);
        const userStats = await getUserStats(user.id);
        
        // Combine personality and trivia results
        const allResults = [
          ...(userStats.personality_results || []).map(result => ({
            ...result,
            type: 'personality',
            trait: result.personality
          })),
          ...(userStats.trivia_results || []).map(result => ({
            ...result,
            type: 'trivia',
            trait: `Score: ${result.score}`
          }))
        ];
        
        // Sort by date (most recent first)
        allResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setResults(allResults);
        setError(null);
      } catch (err) {
        setError('Failed to load your quiz results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTakenQuizzes();
    }
  }, [user]);

  if (loading) return <div className="loading">Loading your quiz results...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="taken-quizzes-page">
      <div className="page-header">
        <h1>🎯 Your Quiz Results</h1>
        <p>See all the quizzes you've taken and your results</p>
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back to Profile
        </button>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">🎯</div>
            <h3>No Quizzes Taken Yet!</h3>
            <p>Take some quizzes to see your results here.</p>
            <div className="empty-actions">
              <Link to="/quiz" className="btn-primary">🌟 Browse Personality Quizzes</Link>
              <Link to="/trivia" className="btn-secondary">🧠 Browse Trivia</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="results-grid">
          {results.map((result) => (
            <div key={`${result.type}-${result.id}`} className={`result-card ${result.type}-result`}>
              <div className="result-icon">
                {result.type === 'personality' ? '🎭' : '🎯'}
              </div>
              
              <div className="result-content">
                <h3 className="quiz-title">
                  {result.quiz_title || `${result.type === 'personality' ? 'Personality Quiz' : 'Trivia Quiz'}`}
                </h3>
                
                <div className="result-trait">
                  <span className="trait-label">
                    {result.type === 'personality' ? 'Your Result:' : 'Your Score:'}
                  </span>
                  <span className={`trait-value ${result.type}`}>
                    {result.trait}
                  </span>
                </div>
                
                <div className="result-date">
                  Taken on {new Date(result.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="result-actions">
                <Link to={`/quiz/${result.quiz_id}`} className="btn-primary">
                  🔄 Retake {result.type === 'personality' ? 'Quiz' : 'Trivia'}
                </Link>
                <Link to={`/result/${result.id}`} className="btn-secondary">
                  📖 View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TakenQuizzes;