// Quiz listing page
import React, { useState } from 'react';
import QuizList from '../components/QuizList';

function QuizListPage() {
  const [filter, setFilter] = useState('personality');

  return (
    <div className="quiz-list-page">
      <div className="page-header">
        <h1>📝 Personality Quizzes</h1>
        <p>Discover more about yourself with our engaging personality assessments!</p>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'personality' ? 'active' : ''}`}
          onClick={() => setFilter('personality')}
        >
          🌟 Personality Tests
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

export default QuizListPage;