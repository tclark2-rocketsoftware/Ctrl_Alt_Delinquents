// Home page
import React, { useState } from 'react';
import QuizList from '../components/QuizList';
import DailyJoke from '../components/DailyJoke';

function Home({ onOpenChat }) {
  const [filter, setFilter] = useState(null);

  return (
    <div className="home">
      <div className="home-header">
        <div className="welcome-banner">
          <h1>🎯 Welcome to Quizruption!</h1>
          <div className="app-overview">
            <p className="main-description">
              Transform your mind through interactive quizzes and trivia! Discover your personality, 
              challenge your knowledge, and have fun while learning about yourself and the world around you.
            </p>
            <div className="feature-highlights">
              <div className="feature">
                <span className="feature-icon">🌟</span>
                <span className="feature-text">Personality Tests</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🧠</span>
                <span className="feature-text">Mind-Bending Trivia</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎲</span>
                <span className="feature-text">Daily Challenges</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Flying Turtle - Click to open chat */}
        {onOpenChat && (
          <div 
            className="bouncing-turtle clickable-turtle" 
            onClick={onOpenChat}
            title="🐢 Click me to chat with Terry the Turtle!"
          >
            🐢
            <div className="turtle-speech-bubble">Click me!</div>
          </div>
        )}
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
      
      {/* Daily Joke Section */}
      <div className="home-joke-section">
        <DailyJoke />
      </div>
    </div>
  );
}

export default Home;
