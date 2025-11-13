// Home page
import React, { useState } from 'react';
import QuizList from '../components/QuizList';

function Home() {
  const [filter, setFilter] = useState(null);

  return (
    <div className="home">
      <div className="home-header">
        <h1>Welcome to Quizruption</h1>
        <p>Discover yourself through personality tests and challenge your mind with trivia! 🧠✨</p>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === null ? 'active' : ''}`}
          onClick={() => setFilter(null)}
        >
          🎲 All Quizzes
        </button>
        <button 
          className={`filter-btn ${filter === 'trivia' ? 'active' : ''}`}
          onClick={() => setFilter('trivia')}
        >
          🧠 Trivia
        </button>
        <button 
          className={`filter-btn ${filter === 'personality' ? 'active' : ''}`}
          onClick={() => setFilter('personality')}
        >
          🌟 Personality
        </button>
      </div>

      <QuizList filter={filter} />
    </div>
  );
}

export default Home;
