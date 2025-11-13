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
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-link">📊 Dashboard</Link>
              </li>
              <li className="navbar-item">
                <Link to="/create" className="navbar-link">✨ Create Quiz</Link>
              </li>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link">👤 Profile</Link>
              </li>
              <li className="navbar-item">
                <span className="navbar-user">👋 {user?.display_name || user?.username}</span>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-logout">🚪 Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">🔐 Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link">✨ Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
