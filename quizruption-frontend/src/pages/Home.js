// Home page
import React, { useState } from 'react';
import QuizList from '../components/QuizList';
import TriviaList from '../components/TriviaList';
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

      <div className="home-content">
        <div className="quiz-trivia-container">
          <div className="quiz-section">
            <QuizList filter="personality" limit={5} showTitle={true} />
          </div>
          <div className="trivia-section">
            <TriviaList limit={5} />
          </div>
        </div>
      </div>
      
      {/* Daily Joke Section */}
      <div className="home-joke-section">
        <DailyJoke />
      </div>
    </div>
  );
}

export default Home;
