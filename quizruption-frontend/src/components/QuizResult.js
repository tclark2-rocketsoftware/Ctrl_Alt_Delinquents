// Display results + personality content
import React from 'react';

function QuizResult({ result }) {
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
            <h2>Your Personality</h2>
            <div className="personality-type">{result.personality}</div>
            
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
