// Display all joke suggestions made by the user
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function JokeSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJokeSuggestions = async () => {
      try {
        setLoading(true);
        const userStats = await getUserStats(user.id);
        setSuggestions(userStats.joke_suggestions || []);
        setError(null);
      } catch (err) {
        setError('Failed to load your joke suggestions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchJokeSuggestions();
    }
  }, [user]);

  if (loading) return <div className="loading">Loading your joke suggestions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="joke-suggestions-page">
      <div className="page-header">
        <h1>😂 Your Joke Suggestions</h1>
        <p>All the jokes you've suggested for the daily joke feature</p>
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back to Profile
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">😂</div>
            <h3>No Joke Suggestions Yet!</h3>
            <p>Submit some jokes to see them here. Your jokes might be featured as the daily joke!</p>
            <div className="empty-actions">
              <a href="/daily-joke" className="btn-primary">📅 Visit Daily Joke</a>
            </div>
          </div>
        </div>
      ) : (
        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <div key={suggestion.id || index} className="suggestion-card">
              <div className="suggestion-content">
                <div className="joke-text">"{suggestion.text || suggestion.joke}"</div>
                
                <div className="suggestion-meta">
                  <span className="suggestion-status">
                    {suggestion.status === 'featured' ? (
                      <span className="status-featured">⭐ Featured</span>
                    ) : suggestion.status === 'approved' ? (
                      <span className="status-approved">✅ Approved</span>
                    ) : suggestion.status === 'pending' ? (
                      <span className="status-pending">⏳ Pending Review</span>
                    ) : (
                      <span className="status-submitted">📝 Submitted</span>
                    )}
                  </span>
                  
                  <span className="suggestion-date">
                    Submitted {new Date(suggestion.created_at || suggestion.date).toLocaleDateString()}
                  </span>
                </div>
                
                {suggestion.featured_date && (
                  <div className="featured-info">
                    🌟 Featured on {new Date(suggestion.featured_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JokeSuggestions;