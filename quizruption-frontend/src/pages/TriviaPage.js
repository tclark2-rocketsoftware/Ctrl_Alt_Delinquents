// Trivia page
import React, { useState } from 'react';
import QuizList from '../components/QuizList';

function TriviaPage() {
  const [selectedTags, setSelectedTags] = useState(['trivia']);
  
  const availableTags = [
    { id: 'music', label: 'Music', emoji: '🎵', color: '#ff6b6b' },
    { id: 'history', label: 'History', emoji: '📜', color: '#4ecdc4' },
    { id: 'geography', label: 'Geography', emoji: '🌍', color: '#45b7d1' },
    { id: 'science', label: 'Science', emoji: '🔬', color: '#96ceb4' },
    { id: 'sports', label: 'Sports', emoji: '⚽', color: '#feca57' },
    { id: 'movies', label: 'Movies', emoji: '🎬', color: '#ff9ff3' },
    { id: 'literature', label: 'Literature', emoji: '📚', color: '#54a0ff' },
    { id: 'general', label: 'General Knowledge', emoji: '🧠', color: '#5f27cd' },
    { id: 'other', label: 'Other', emoji: '🎲', color: '#ff7675' }
  ];

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      // Remove tag if already selected (but keep at least one selected)
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter(tag => tag !== tagId));
      }
    } else {
      // Add tag to selection
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const selectAllTags = () => {
    setSelectedTags(availableTags.map(tag => tag.id));
  };

  return (
    <div className="trivia-page">
      <div className="home-header">
        <div className="welcome-banner">
          <h1>🧠 Trivia Challenges</h1>
          <div className="app-overview">
            <p className="main-description">
              Test your knowledge with our brain-teasing trivia questions!
            </p>
          </div>
        </div>
      </div>

      <div className="tag-filter-section">
        <div className="tag-header">
          <h3>Filter by Trivia Categories:</h3>
          <div className="tag-controls">
            <button 
              className="tag-control-btn"
              onClick={selectAllTags}
            >
              Select All
            </button>
            <button 
              className="tag-control-btn"
              onClick={clearAllTags}
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="tag-container">
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              className={`tag-btn ${selectedTags.includes(tag.id) ? 'tag-active' : ''}`}
              onClick={() => toggleTag(tag.id)}
              style={{
                '--tag-color': tag.color,
                '--tag-color-light': tag.color + '30'
              }}
            >
              <span className="tag-emoji">{tag.emoji}</span>
              <span className="tag-label">{tag.label}</span>
            </button>
          ))}
        </div>
        
        <div className="selected-tags-info">
          {selectedTags.length === 0 ? (
            <p>Showing all trivia</p>
          ) : (
            <p>
              Showing trivia in: {' '}
              {selectedTags.map(tagId => 
                availableTags.find(tag => tag.id === tagId)?.label
              ).join(', ')}
            </p>
          )}
        </div>
      </div>

      <QuizList filter={selectedTags.length === 0 ? null : selectedTags} showTitle={false} />
    </div>
  );
}

export default TriviaPage;