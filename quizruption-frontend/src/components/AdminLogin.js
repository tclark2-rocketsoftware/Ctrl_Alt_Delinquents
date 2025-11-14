import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logger from '../utils/logger';
import '../styles/main.css';

// Admin credentials (in production, this should be environment variables or backend validation)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'  // Change this to a secure password
};

function AdminLogin({ onAdminLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate admin credentials
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Store admin session
        const adminSession = {
          isAdmin: true,
          loginTime: new Date().toISOString(),
          username: username
        };
        
        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        
        // Log successful admin login
        logger.logSecurityEvent('Admin Login Success', {
          username: username,
          timestamp: new Date().toISOString()
        });

        // Call the onAdminLogin callback
        if (onAdminLogin) {
          onAdminLogin(adminSession);
        }

        // Navigate to logging dashboard
        navigate('/admin/logs');
      } else {
        setError('Invalid admin credentials');
        
        // Log failed login attempt
        logger.logSecurityEvent('Admin Login Failed', {
          username: username,
          reason: 'Invalid credentials',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setError('An error occurred during login');
      logger.error('Admin login error', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>🔒 Admin Access</h1>
          <p>Enter admin credentials to view system logs</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Login as Admin'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch" style={{ marginBottom: '1rem', color: '#a0aec0', fontSize: '0.875rem' }}>
              Default credentials: admin / admin123
            </p>
            <Link to="/" className="auth-link">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
