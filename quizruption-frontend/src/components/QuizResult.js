// Display results + personality content
import React, { useEffect, useState } from 'react';
import { getQuiz } from '../services/api';

function QuizResult({ result }) {
  const [mappedName, setMappedName] = useState(null);
  const [quizPersonalities, setQuizPersonalities] = useState([]);

  // Attempt to map legacy personality id (e.g., personality_123) to its title
  useEffect(() => {
    // If backend already provided structured outcome with name, use it
    if (result?.personality_outcome?.name) {
      setMappedName(result.personality_outcome.name);
      return;
    }

    const raw = result?.personality;
    if (!raw) return;

    // Only attempt fetch if looks like internal id and no outcome name
    if (raw.startsWith('personality_')) {
      (async () => {
        try {
          const quiz = await getQuiz(result.quiz_id);
          if (quiz && Array.isArray(quiz.personalities)) {
            setQuizPersonalities(quiz.personalities);
            const def = quiz.personalities.find(p => p.id === raw);
            if (def && def.name) {
              setMappedName(def.name);
            }
          }
        } catch (e) {
          // Silent fail; we'll fall back to raw id
        }
      })();
    } else {
      // Raw already looks like a human-readable name
      setMappedName(raw);
    }
  }, [result]);

  // Fallback: if we still don't have mappedName but we have an outcome without name, try mapping winning id
  useEffect(() => {
    if (!mappedName && result?.personality_outcome && !result.personality_outcome.name) {
      const winningId = result.personality_outcome.id || result.personality_outcome.winning;
      if (winningId) {
        // Attempt mapping from personalities we may already have
        const def = quizPersonalities.find(p => p.id === winningId);
        if (def && def.name) {
          setMappedName(def.name);
        } else if (typeof winningId === 'string' && winningId.startsWith('personality_')) {
          // Make a readable fallback by stripping prefix
            const readable = winningId.replace(/^personality_/, '');
            setMappedName(`Personality ${readable}`);
        } else if (winningId) {
          setMappedName(winningId);
        }
      }
    }
  }, [mappedName, result, quizPersonalities]);
  const shareResult = () => {
    const shareText = result.score !== null 
      ? `I scored ${result.score} on this quiz!`
      : `I'm a ${result.personality}!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Result',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      alert('Result link copied to clipboard!');
    }
  };

  return (
    <div className="quiz-result">
      <div className="result-card">
        {result.score !== null ? (
          <div className="trivia-result">
            <h2>Your Score</h2>
            <div className="score-display">{result.score}</div>
            <p className="score-message">
              {result.score >= 8 ? 'Excellent!' : 
               result.score >= 5 ? 'Good job!' : 
               'Keep practicing!'}
            </p>
          </div>
        ) : (
          <div className="personality-result">
            <div className="personality-header">
              <h2>Your Personality Type</h2>
              
              {/* New personality outcome display */}
              {result.personality_outcome ? (
                <div className="personality-outcome">
                  {result.personality_outcome.image_url && (
                    <div className="personality-image-container">
                      <img 
                        src={result.personality_outcome.image_url.startsWith('http') 
                          ? result.personality_outcome.image_url 
                          : `http://localhost:8000${result.personality_outcome.image_url}`
                        } 
                        alt={result.personality_outcome.name}
                        className="personality-result-image"
                      />
                    </div>
                  )}
                  
                  <div className="personality-info">
                    <div className="personality-title">
                      {result.personality_outcome.emoji && (
                        <span className="personality-emoji">{result.personality_outcome.emoji}</span>
                      )}
                      <h3>{result.personality_outcome.name || mappedName || result.personality}</h3>
                    </div>
                    
                    {result.personality_outcome.description && (
                      <div className="personality-description">
                        <p>{result.personality_outcome.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Fallback for old personality format: use mappedName if available
                <div className="personality-type">{mappedName || result.personality}</div>
              )}
            </div>
            
            {result.personality_content && (
              <div className="personality-content">
                {result.personality_content.quote && (
                  <blockquote className="daily-quote">
                    "{result.personality_content.quote}"
                  </blockquote>
                )}
                
                {result.personality_content.gif_url && (
                  <img 
                    src={result.personality_content.gif_url} 
                    alt="Personality GIF"
                    className="personality-gif"
                  />
                )}
                
                {result.personality_content.joke && (
                  <div className="daily-joke">
                    <h3>Joke of the Day</h3>
                    <p>{result.personality_content.joke}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <button onClick={shareResult} className="btn-share">
          Share Result
        </button>
      </div>
    </div>
  );
}

export default QuizResult;
