import React, { useEffect, useState } from 'react';
import { getDailyJoke, nextAvailableDate } from '../services/jokeService';

function DailyJoke() {
  const [joke, setJoke] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [visitStreak, setVisitStreak] = useState(() => {
    const streak = localStorage.getItem('jokeVisitStreak');
    return streak ? JSON.parse(streak) : { count: 0, lastVisit: null };
  });

  useEffect(() => {
    let mounted = true;
    
    // Update visit streak
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = visitStreak.lastVisit;
    
    if (lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const newStreak = lastVisit === yesterdayStr 
        ? { count: visitStreak.count + 1, lastVisit: today }
        : { count: 1, lastVisit: today };
      
      setVisitStreak(newStreak);
      localStorage.setItem('jokeVisitStreak', JSON.stringify(newStreak));
    }
    
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDailyJoke();
        if (mounted) {
          setJoke(result.joke);
          setSource(result.source);
          setCached(result.cached);
          setGifUrl(result.gif_url);
          setImageUrl(result.image_url);
          setAuthor(result.author);
        }
      } catch (e) {
        if (mounted) setError('Could not load today\'s joke.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (suggestion.trim()) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/jokes/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ suggestion_text: suggestion.trim() })
        });

        if (response.ok) {
          setSuggestionSubmitted(true);
          setSuggestion('');
          setTimeout(() => setSuggestionSubmitted(false), 3000);
        } else {
          console.error('Failed to submit suggestion');
        }
      } catch (error) {
        console.error('Error submitting suggestion:', error);
      }
    }
  };

  const handleCopyJoke = async () => {
    const textToCopy = `${joke}\n\n— ${author}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) return (
    <div className="loading-skeleton">
      <div className="skeleton-card">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
        <div className="skeleton-gif"></div>
      </div>
    </div>
  );
  
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="daily-joke-page">
      {visitStreak.count >= 3 && (
        <div className="streak-badge">
          🔥 {visitStreak.count} Day Streak!
        </div>
      )}
      
      <div className="bouncing-turtle">
        🐢
        <div className="turtle-speech-bubble">HELLO</div>
      </div>
      
      <div className="daily-joke-card">
        <h1>Daily Joke</h1>
        
        <div className="joke-actions">
          <button 
            className="copy-btn" 
            onClick={handleCopyJoke}
            title="Copy joke to clipboard"
          >
            {copySuccess ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        
        <p className="joke-text">{joke}</p>
        {author && <p className="joke-author">— {author}</p>}
        {gifUrl && (
          <div className="joke-gif-wrapper">
            <img src={gifUrl} alt="Animated reaction to joke" className="joke-gif" loading="lazy" />
          </div>
        )}
        <div className="joke-meta">
          <span>Source: {source === 'openai' ? 'AI generated' : 'Fallback generator'}</span>
          {cached && <span className="cached-tag">Stored for today</span>}
        </div>
        <div className="joke-info">
          <small>Next joke available: {nextAvailableDate()}</small>
        </div>

        <div className="joke-suggestion-section">
          <h3>Suggest Tomorrow's Joke Theme</h3>
          <p className="suggestion-description">
            Help guide the AI! Share a topic, scenario, or theme you'd like to see in a future joke.
          </p>
          <form onSubmit={handleSuggestionSubmit} className="suggestion-form">
            <div className="char-counter">
              {suggestion.length}/200 characters
            </div>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="e.g., 'a joke about merge conflicts', 'something about code reviews', 'debugging on production'..."
              className="suggestion-input"
              rows="3"
              maxLength="200"
            />
            <button 
              type="submit" 
              className="btn-primary suggestion-btn"
              disabled={!suggestion.trim() || suggestionSubmitted}
            >
              {suggestionSubmitted ? '✓ Suggestion Saved!' : 'Submit Suggestion'}
            </button>
          </form>
          {suggestionSubmitted && (
            <p className="suggestion-success">Thanks! Your suggestion will inspire future jokes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyJoke;
