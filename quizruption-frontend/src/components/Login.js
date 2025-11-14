import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  // Use environment variable for API URL, fallback to localhost
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
  const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
  // Store the access token
  localStorage.setItem('authToken', data.access_token);
  // Pass the user object to onLogin (which calls login)
  onLogin(data.user);
  // Navigate to home page to show welcome banner
  navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || errorData.message || 'Login failed');
      }
    } catch (err) {
      // Axios error handling
      if (err.response) {
        const errorData = err.response.data || {};
        setError(errorData.detail || errorData.message || 'Login failed');
      } else if (err.request) {
        // Likely a network / host resolution issue
        setError('Network error. Please check your connection or API URL.');
      } else {
        setError('Unexpected error. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Welcome Back! 🎯</h1>
          <p>Sign in to continue your quiz journey</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary auth-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="auth-switch">
              Don't have an account? 
              <Link to="/register" className="auth-link"> Create one here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
