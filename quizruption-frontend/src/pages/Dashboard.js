import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p>Here's your quiz journey so far</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card stats-card">
            <h3>📊 Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{user?.quizzesCompleted || 0}</div>
                <div className="stat-label">Quizzes Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{user?.personalityTypes?.length || 0}</div>
                <div className="stat-label">Personalities Discovered</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{user?.averageScore || 0}%</div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card personality-card">
            <h3>🌟 Your Personality Types</h3>
            {user?.personalityTypes && user.personalityTypes.length > 0 ? (
              <div className="personality-list">
                {user.personalityTypes.map((personality, index) => (
                  <div key={index} className="personality-item">
                    <div className="personality-name">{personality.type}</div>
                    <div className="personality-quiz">{personality.quizTitle}</div>
                    <div className="personality-date">{new Date(personality.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>🎭 No personality types discovered yet!</p>
                <p>Take a personality quiz to see your results here.</p>
              </div>
            )}
          </div>

          <div className="dashboard-card recent-card">
            <h3>🕒 Recent Activity</h3>
            {user?.recentQuizzes && user.recentQuizzes.length > 0 ? (
              <div className="recent-list">
                {user.recentQuizzes.map((quiz, index) => (
                  <div key={index} className="recent-item">
                    <div className="recent-title">{quiz.title}</div>
                    <div className="recent-score">Score: {quiz.score}%</div>
                    <div className="recent-date">{new Date(quiz.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>📝 No quiz history yet!</p>
                <p>Start taking quizzes to see your activity here.</p>
              </div>
            )}
          </div>

          <div className="dashboard-card actions-card">
            <h3>⚙️ Account Actions</h3>
            <div className="action-buttons">
              <button className="btn-secondary" onClick={() => window.location.href = '/'}>
                🏠 Back to Home
              </button>
              <button className="btn-secondary" onClick={() => window.location.href = '/create'}>
                ✨ Create Quiz
              </button>
              <button className="btn-danger" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;