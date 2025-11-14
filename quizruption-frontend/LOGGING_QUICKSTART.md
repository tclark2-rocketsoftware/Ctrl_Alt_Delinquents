# Secure Logging System - Quick Start Guide

## ✅ Installation Complete!

Your application now has a comprehensive secure logging system installed. Here's what was added:

## 📦 New Files

```
quizruption-frontend/
├── src/
│   ├── utils/
│   │   └── logger.js                    # Core logging system
│   ├── components/
│   │   ├── ErrorBoundary.js             # React error catching
│   │   └── LoggingDashboard.js          # Admin logging UI
│   ├── services/
│   │   └── apiInterceptor.js            # API logging middleware
└── LOGGING_SYSTEM.md                    # Complete documentation
```

## 🚀 What's Working Now

### 1. Automatic Logging
- ✅ All API calls are logged automatically
- ✅ Errors are caught and logged
- ✅ Sensitive data (passwords, tokens) is automatically redacted
- ✅ Performance metrics are tracked

### 2. Error Boundary
- ✅ React component errors are caught gracefully
- ✅ User-friendly error UI is displayed
- ✅ Error details are logged securely
- ✅ Download logs button available in development

### 3. Logging Dashboard
- ✅ Access at: http://localhost:3000/admin/logs
- ✅ View all logs in real-time
- ✅ Filter by level (DEBUG, INFO, WARN, ERROR, SECURITY)
- ✅ Search logs
- ✅ Download logs as JSON
- ✅ Auto-refresh option

## 🎯 Next Steps

### 1. Test the Logging System

Open your browser console and run:

```javascript
// Access the logger (it's a global singleton)
import logger from './utils/logger';

// Test different log levels
logger.debug('Testing debug log');
logger.info('Testing info log');
logger.warn('Testing warning log');
logger.error('Testing error log');

// Test user action logging
logger.logUserAction('Button Click', { buttonId: 'test' });

// Test security logging
logger.logSecurityEvent('Test Security Event', { detail: 'test' });
```

### 2. View the Dashboard

1. Log in to your application
2. Navigate to: http://localhost:3000/admin/logs
3. You should see all logs from your session
4. Try the search and filter features

### 3. Test Error Boundary

Create an intentional error to see the error boundary:

```javascript
// In any component
throw new Error('Test error boundary');
```

You should see a friendly error page with options to:
- Try again
- Go home
- Download logs (in development mode)

### 4. Check API Logging

Make any API call in your app (login, load quiz, etc.) and check:
1. Browser console - see the API logs
2. Dashboard - see structured log entries
3. Network tab - confirm requests are being tracked

## 📝 Usage Examples

### In Your Components

```javascript
import logger from '../utils/logger';

function MyComponent() {
  const handleClick = () => {
    logger.logUserAction('Button Clicked', { 
      button: 'submit',
      page: 'quiz'
    });
  };

  const handleError = (error) => {
    logger.error('Failed to save data', {
      error: error.message,
      userId: user.id
    });
  };

  // Performance tracking
  const loadData = async () => {
    logger.startPerformance('loadQuizData');
    await fetchQuizData();
    logger.endPerformance('loadQuizData');
  };
}
```

### Security Events

```javascript
// In authentication flow
const handleLogin = async (credentials) => {
  try {
    const result = await login(credentials);
    logger.logSecurityEvent('Login Success', { 
      userId: result.user.id 
    });
  } catch (error) {
    logger.logSecurityEvent('Login Failed', { 
      username: credentials.username,
      reason: error.message
    });
  }
};
```

## 🔧 Configuration

### Set Log Level for Production

In `.env`:

```env
# Only log warnings and errors in production
REACT_APP_LOG_LEVEL=2

# Enable remote logging (optional)
REACT_APP_REMOTE_LOGGING=true
REACT_APP_LOG_ENDPOINT=https://your-backend.com/api/logs
```

### Customize Sensitive Data Detection

Edit `src/utils/logger.js`:

```javascript
const SENSITIVE_KEYS = [
  'password',
  'token',
  'authToken',
  // Add your custom fields
  'socialSecurityNumber',
  'creditCardNumber',
];
```

## 🎨 Dashboard Features

### Statistics
- Total log count
- Breakdown by level (DEBUG, INFO, WARN, ERROR, SECURITY)
- Visual indicators with color coding

### Controls
- **Search**: Find specific logs by message or data
- **Filter**: Show only specific log levels
- **Auto-refresh**: Update logs every 3 seconds
- **Download**: Export logs as JSON file
- **Clear**: Remove all logs from storage

### Log Details
Click any log entry to see:
- Full timestamp
- Session ID
- URL where log occurred
- User agent
- Viewport size
- Complete data (sanitized)

## 🔒 Security Features

### Automatic Sanitization

Sensitive data is automatically redacted:

```javascript
// Input
logger.info('User registered', {
  username: 'john',
  email: 'john@example.com',
  password: 'secret123',      // ← Will be redacted
  authToken: 'abc123'          // ← Will be redacted
});

// Logged as
{
  username: 'john',
  email: 'jo***@example.com',   // ← Partially redacted
  password: '[REDACTED]',       // ← Fully redacted
  authToken: '[REDACTED]'       // ← Fully redacted
}
```

### Security Event Tracking

Automatically tracks:
- Failed login attempts (401 errors)
- Forbidden access (403 errors)
- Rate limiting (429 errors)
- Suspicious activity patterns

### Session Tracking

Each browser session gets a unique ID:
- Helps correlate logs
- Useful for debugging user-specific issues
- Included in all log entries

## 📊 Monitoring Best Practices

### Regular Reviews

1. **Daily**: Check ERROR and SECURITY logs
2. **Weekly**: Review WARN logs
3. **Monthly**: Analyze performance metrics

### What to Look For

🚨 **Red Flags**:
- High frequency of ERROR logs
- Repeated SECURITY events from same user
- Unusual API failure patterns
- Performance degradation over time

✅ **Good Signs**:
- Mostly DEBUG/INFO logs
- Consistent API response times
- Clean error recovery

## 🐛 Troubleshooting

### Logs Not Appearing in Dashboard

1. Check browser console for errors
2. Verify localStorage isn't full
3. Clear logs and try again: `logger.clearLogs()`

### Can't Access Dashboard

1. Ensure you're logged in
2. Check the route is `/admin/logs`
3. Verify the route is in App.js

### Performance Issues

1. Reduce MAX_LOG_SIZE in logger.js
2. Disable auto-refresh in dashboard
3. Clear old logs regularly

## 📚 Additional Resources

- **Full Documentation**: See `LOGGING_SYSTEM.md`
- **API Reference**: Check logger.js comments
- **Examples**: Browse existing component integrations

## 🎉 You're All Set!

The logging system is now:
- ✅ Integrated into your application
- ✅ Protecting sensitive data
- ✅ Catching errors gracefully
- ✅ Tracking performance
- ✅ Ready for production

Start logging today and gain insights into your application's behavior!

---

**Need Help?**
- Review LOGGING_SYSTEM.md for detailed docs
- Check logger.js for implementation details
- Test in development mode first
- Monitor the dashboard regularly
