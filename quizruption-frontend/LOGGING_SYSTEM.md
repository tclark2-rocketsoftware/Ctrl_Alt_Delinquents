# Secure Frontend Logging System

## Overview

A comprehensive, production-ready logging system for React applications with built-in security features, PII sanitization, and error tracking.

## Features

### 🔒 Security First
- **Automatic PII Sanitization**: Redacts sensitive data (passwords, tokens, emails, etc.)
- **Security Event Tracking**: Monitors suspicious activities
- **Session Tracking**: Unique session IDs for debugging
- **Safe Storage**: Encrypted local storage with size limits

### 📊 Comprehensive Logging
- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, SECURITY
- **Structured Logging**: Consistent JSON format
- **Context Capture**: URL, viewport, user agent
- **Performance Tracking**: Built-in performance monitoring

### 🛠️ Developer Tools
- **Error Boundary**: React error catching with UI
- **Logging Dashboard**: Visual interface for log management
- **Export/Download**: JSON export functionality
- **Auto-refresh**: Real-time log viewing

### 🚀 Production Ready
- **Environment Aware**: Different behaviors for dev/production
- **Remote Logging**: Optional backend integration
- **Size Management**: Automatic log rotation
- **Age Limits**: Auto-cleanup of old logs

## Quick Start

### 1. Basic Usage

```javascript
import logger from './utils/logger';

// Simple logging
logger.info('User logged in', { userId: 123 });
logger.warn('API slow response', { duration: 5000 });
logger.error('Failed to load data', { error: err.message });

// Security events
logger.logSecurityEvent('Failed Login Attempt', { username: 'user@example.com' });

// User actions
logger.logUserAction('Button Click', { buttonId: 'submit' });
```

### 2. API Integration

Update your API service to use the enhanced interceptor:

```javascript
// Instead of:
// import api from './services/api';

// Use:
import api from './services/apiInterceptor';

// All API calls are now automatically logged
const data = await api.get('/quizzes');
```

### 3. Error Boundary Integration

Wrap your app with the ErrorBoundary component:

```javascript
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 4. Add Logging Dashboard

Add the dashboard to your admin routes:

```javascript
import LoggingDashboard from './components/LoggingDashboard';

// In your routes
<Route path="/admin/logs" element={<LoggingDashboard />} />
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Log level in production (DEBUG=0, INFO=1, WARN=2, ERROR=3, SECURITY=4)
REACT_APP_LOG_LEVEL=2

# Enable remote logging
REACT_APP_REMOTE_LOGGING=false

# Remote log endpoint
REACT_APP_LOG_ENDPOINT=https://your-api.com/logs
```

### Customization

Modify sensitive keys in `logger.js`:

```javascript
const SENSITIVE_KEYS = [
  'password',
  'token',
  'authToken',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'creditCard',
  'ssn',
  'email',
  'phone',
  // Add your custom sensitive fields
];
```

## API Reference

### Logger Methods

#### Log Levels
```javascript
logger.debug(message, data?)    // Development debugging
logger.info(message, data?)     // General information
logger.warn(message, data?)     // Warning conditions
logger.error(message, data?)    // Error conditions
logger.security(message, data?) // Security events
```

#### Special Logging
```javascript
logger.logUserAction(action, details?)
logger.logSecurityEvent(event, details?)
logger.logComponentError(error, errorInfo)
logger.logApiCall(method, url, status, duration, error?)
```

#### Performance Tracking
```javascript
logger.startPerformance('operation-name');
// ... do work ...
const duration = logger.endPerformance('operation-name');
```

#### Log Management
```javascript
logger.exportLogs()      // Get all logs as JSON
logger.downloadLogs()    // Download logs file
logger.clearLogs()       // Clear all logs
logger.getStats()        // Get logging statistics
```

## Security Best Practices

### 1. Never Log Sensitive Data Directly

❌ **DON'T:**
```javascript
logger.info('User login', { 
  password: userPassword,  // NEVER!
  creditCard: cardNumber   // NEVER!
});
```

✅ **DO:**
```javascript
logger.info('User login', { 
  userId: user.id,
  timestamp: Date.now()
});
// Sanitizer will handle any sensitive data automatically
```

### 2. Use Appropriate Log Levels

```javascript
// Production: Only WARN and above
logger.debug('Cache hit');           // Not logged in production
logger.info('User action');          // Not logged in production
logger.warn('Slow API response');    // Logged in production
logger.error('API failed');          // Logged in production
logger.security('Login attempt');    // Always logged
```

### 3. Secure Remote Logging

When enabling remote logging:

```javascript
// backend/routes/logs.js
app.post('/api/logs', authenticate, rateLimit, async (req, res) => {
  // Validate log data
  // Store securely
  // Implement rate limiting
  // Require authentication
});
```

## Performance Considerations

### Storage Limits

The logger automatically manages storage:

```javascript
const MAX_LOG_SIZE = 500;              // Max logs in memory
const MAX_LOG_AGE_MS = 24 * 60 * 60 * 1000;  // 24 hours
```

### Log Rotation

Logs are automatically:
- Trimmed when exceeding MAX_LOG_SIZE
- Cleaned when exceeding MAX_LOG_AGE_MS
- Compressed before storage

### Performance Impact

- **Development**: Minimal impact (~1-2ms per log)
- **Production**: Negligible (only WARN+ logged)
- **Storage**: ~1KB per 10 logs (after sanitization)

## Logging Dashboard

Access at `/admin/logs`:

### Features
- 📊 Real-time statistics by log level
- 🔍 Search and filter logs
- 📥 Download logs as JSON
- 🗑️ Clear logs
- 🔄 Auto-refresh option
- 📱 Responsive design

### Keyboard Shortcuts
- `Ctrl+K`: Focus search
- `Ctrl+D`: Download logs
- `Ctrl+R`: Refresh logs

## Error Boundary

The ErrorBoundary component:

- Catches React component errors
- Logs errors automatically
- Shows user-friendly error UI
- Provides recovery options
- Tracks error frequency
- Security alerts on high error counts

### Development Mode
Shows detailed error stack traces

### Production Mode
Shows generic error message, logs details securely

## Integration Examples

### With Authentication

```javascript
// components/Login.js
import logger from '../utils/logger';

const handleLogin = async (credentials) => {
  logger.startPerformance('login');
  
  try {
    const response = await api.post('/auth/login', credentials);
    logger.logUserAction('Login Success', { userId: response.data.user.id });
    logger.endPerformance('login');
  } catch (error) {
    logger.logSecurityEvent('Login Failed', { 
      username: credentials.username,
      error: error.message 
    });
    logger.endPerformance('login');
  }
};
```

### With Quiz Submission

```javascript
// components/QuizSubmit.js
const handleSubmit = async (answers) => {
  logger.logUserAction('Quiz Submitted', { 
    quizId,
    questionCount: answers.length 
  });
  
  try {
    const result = await api.post('/submit', answers);
    logger.info('Quiz submission successful', { 
      resultId: result.id,
      score: result.score 
    });
  } catch (error) {
    logger.error('Quiz submission failed', { 
      quizId,
      error: error.message 
    });
  }
};
```

### With Payment Processing

```javascript
// Never log payment details directly!
logger.info('Payment initiated', {
  orderId: order.id,
  amount: order.amount,
  // Payment details automatically sanitized
});
```

## Troubleshooting

### Logs Not Appearing

1. Check log level:
```javascript
// In logger.js
this.logLevel = LOG_LEVELS.DEBUG; // Set to DEBUG temporarily
```

2. Check localStorage:
```javascript
// In console
localStorage.getItem('app_logs');
```

3. Check browser console for errors

### Storage Full

Clear old logs:
```javascript
logger.clearLogs();
```

Or increase limits:
```javascript
const MAX_LOG_SIZE = 1000; // Increase limit
```

### Remote Logging Not Working

1. Verify environment variable:
```env
REACT_APP_REMOTE_LOGGING=true
REACT_APP_LOG_ENDPOINT=https://your-api.com/logs
```

2. Check CORS settings on backend

3. Verify network requests in DevTools

## Best Practices Checklist

- ✅ Use ErrorBoundary at app root
- ✅ Import logger from single source
- ✅ Use appropriate log levels
- ✅ Never log raw passwords/tokens
- ✅ Test in production mode before deploy
- ✅ Set up remote logging endpoint
- ✅ Monitor log dashboard regularly
- ✅ Clear old logs periodically
- ✅ Review security events weekly

## License

MIT

## Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check browser console
4. Download logs for debugging
5. Contact development team
