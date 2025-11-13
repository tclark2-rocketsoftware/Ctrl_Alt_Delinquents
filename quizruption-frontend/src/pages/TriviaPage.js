// Trivia page
import React, { useState } from 'react';
import QuizList from '../components/QuizList';

function TriviaPage() {
  const [filter, setFilter] = useState('trivia');

  return (
    <div className="trivia-page">
      <div className="page-header">
        <h1>🧠 Trivia Challenges</h1>
        <p>Test your knowledge with our brain-teasing trivia questions!</p>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'trivia' ? 'active' : ''}`}
          onClick={() => setFilter('trivia')}
        >
          🧠 Trivia Questions
        </button>
        <button 
          className={`filter-btn ${filter === null ? 'active' : ''}`}
          onClick={() => setFilter(null)}
        >
          🎲 All Quizzes
        </button>
      </div>

      <QuizList filter={filter} />
    </div>
  );
}

export default TriviaPage;