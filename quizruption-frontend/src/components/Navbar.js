// Navigation bar
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Quizruption
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/create" className="navbar-link">Create Quiz</Link>
          </li>
          <li className="navbar-item">
            <Link to="/daily-joke" className="navbar-link">Daily Joke</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
