// Navigation bar
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎯 Quizruption
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">🏠 Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/quiz" className="navbar-link">� Quiz</Link>
          </li>
          <li className="navbar-item">
            <Link to="/trivia" className="navbar-link">🧠 Trivia</Link>
          </li>
          <li className="navbar-item">
            {isAuthenticated ? (
              <Link to="/profile" className="navbar-link profile-icon">👤</Link>
            ) : (
              <Link to="/login" className="navbar-link profile-icon">👤</Link>
            )}
          </li>
          {isAuthenticated && (
            <li className="navbar-item">
              <button onClick={handleLogout} className="navbar-logout">🚪 Logout</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
