// Display all quizzes taken by the user with their results
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserStats } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

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
        logger.info('TakenQuizzes: Fetching user quiz results', { userId: user.id });
        
        const userStats = await getUserStats(user.id);
        
        logger.info('TakenQuizzes: User stats fetched successfully', { 
          personalityCount: userStats.personality_results?.length || 0,
          triviaCount: userStats.trivia_results?.length || 0
        });
        
        // Combine personality and trivia results with enhanced data
        const allResults = [
          ...(userStats.personality_results || []).map(result => ({
            ...result,
            type: 'personality',
            trait: result.personality,
            quiz_title: result.quiz_title,
            personality_data: result.personality_data // Full outcome data with image
          })),
          ...(userStats.trivia_results || []).map(result => ({
            ...result,
            type: 'trivia',
            trait: result.total_questions > 0 ? `${result.score}/${result.total_questions}` : `Score: ${result.score}`,
            quiz_title: result.quiz_title
          }))
        ];
        
        // Sort by date (most recent first)
        allResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setResults(allResults);
        setError(null);
        logger.info('TakenQuizzes: Results loaded successfully', { totalResults: allResults.length });
      } catch (err) {
        const errorMessage = 'Failed to load your quiz results';
        setError(errorMessage);
        logger.error('TakenQuizzes: Failed to fetch quiz results', {
          error: err.message,
          userId: user.id
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTakenQuizzes();
    } else {
      logger.warning('TakenQuizzes: No user found, redirecting to login');
    }
  }, [user]);

  if (loading) return <div className="loading">Loading your quiz results...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="taken-quizzes-page">
      <div className="page-header">
        <h1>🎯 Your Quiz Results</h1>
        <p>See all the quizzes you've taken and your results</p>
        <div className="header-actions">
          <Link to="/create" className="btn-primary create-new-btn">
            ✨ Create New Quiz
          </Link>
        </div>
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
              
              {/* Personality result with image */}
              {result.type === 'personality' && result.personality_data ? (
                <div className="personality-result-display">
                  {result.personality_data.image && (
                    <div className="personality-image">
                      <img 
                        src={`http://localhost:8000/static/personalities/${result.personality_data.image}`} 
                        alt={result.personality_data.name || result.trait}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="personality-info">
                    <h3 className="quiz-title">{result.quiz_title}</h3>
                    <div className="personality-outcome">
                      <h4 className="personality-name">
                        {result.personality_data.name || result.trait}
                      </h4>
                      {result.personality_data.description && (
                        <p className="personality-description">
                          {result.personality_data.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard layout for trivia or fallback */
                <>
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
                  </div>
                </>
              )}
              
              <div className="result-meta">
                <div className="result-date">
                  Taken on {new Date(result.created_at).toLocaleDateString()}
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

export default TakenQuizzes;