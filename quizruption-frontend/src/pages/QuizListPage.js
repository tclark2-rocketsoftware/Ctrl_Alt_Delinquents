// Quiz listing page
import React, { useState } from 'react';
import QuizList from '../components/QuizList';

function QuizListPage() {
  const [selectedTags, setSelectedTags] = useState(['personality']);
  
  const availableTags = [
    { id: 'personality', label: 'Personality', emoji: '🌟', color: '#cc95af' },
    { id: 'fun', label: 'Fun', emoji: '🎉', color: '#ba99dc' },
    { id: 'educational', label: 'Educational', emoji: '📚', color: '#667eea' },
    { id: 'creative', label: 'Creative', emoji: '🎨', color: '#f093fb' },
    { id: 'lifestyle', label: 'Lifestyle', emoji: '🌱', color: '#4facfe' },
    { id: 'career', label: 'Career', emoji: '💼', color: '#43e97b' },
    { id: 'other', label: 'Other', emoji: '🎲', color: '#ff6b6b' }
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
    <div className="quiz-list-page">
      <div className="home-header">
        <div className="welcome-banner">
          <h1>📝 Quiz Zone</h1>
          <div className="app-overview">
            <p className="main-description">
              Discover quizzes tailored to your interests with our tag-based filtering system!
            </p>
          </div>
        </div>
      </div>

      <div className="tag-filter-section">
        <div className="tag-header">
          <h3>Filter by Tags:</h3>
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
            <p>Showing all quizzes</p>
          ) : (
            <p>
              Showing quizzes tagged with: {' '}
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

export default QuizListPage;