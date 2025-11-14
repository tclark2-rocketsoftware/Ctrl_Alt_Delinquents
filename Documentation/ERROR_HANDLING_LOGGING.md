# Error Handling and Logging Guide

## Overview

This document outlines the comprehensive error handling and logging strategy implemented across the Quizruption application, covering both backend (FastAPI) and frontend (React) components.

## Backend Logging (FastAPI)

### Logger Configuration

The backend uses Python's built-in `logging` module with rotating file handlers:

```python
import logging
from logging.handlers import RotatingFileHandler

# Initialize logger in each module
logger = logging.getLogger(__name__)
```

### Log Levels

- **DEBUG**: Detailed diagnostic information
- **INFO**: General operational information
- **WARNING**: Something unexpected but recoverable
- **ERROR**: Error conditions that should be investigated
- **CRITICAL**: System-threatening errors

### Backend Logging Implementation

#### Authentication Routes (`auth.py`)

```python
# Login attempt logging
logger.info(f"Login attempt for user: {user_data.username}")

# Successful authentication
logger.info(f"User {user.username} authenticated successfully")

# Failed authentication
logger.warning(f"Failed login attempt for user: {user_data.username}")

# Token validation errors
logger.warning(f"Invalid token access attempt: {str(e)}")
```

#### Upload Routes (`uploads.py`)

```python
# File upload initiation
logger.info(f"Profile image upload attempt - filename: {image.filename}, content_type: {image.content_type}")

# File validation failures
logger.warning(f"Profile image upload failed - invalid content type: {image.content_type}")

# Successful uploads
logger.info(f"Profile image uploaded successfully for user {user.username}: {image_url}")

# Upload errors
logger.error(f"Error uploading profile image for user {user.username}: {str(e)}")
```

#### Result Service (`result_service.py`)

```python
# Quiz result calculations
logger.info(f"Calculating result for quiz {quiz_id}, user {user_id}")

# Personality scoring
logger.debug(f"Personality weights calculated: {personality_scores}")

# Errors in result calculation
logger.error(f"Error calculating quiz result: {str(e)}")
```

### Log File Configuration

```python
# Rotating file handler prevents log files from growing too large
file_handler = RotatingFileHandler(
    'app.log', 
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5  # Keep 5 backup files
)
```

## Frontend Logging (React)

### Logger Import and Usage

```javascript
import logger from '../utils/logger';

// Component initialization
logger.info('Component: Component initialized', { props: someProps });

// User actions
logger.info('Component: User action performed', { action: 'button_click', data: actionData });

// API calls
logger.info('Component: API request initiated', { endpoint: '/api/users', method: 'GET' });

// Errors
logger.error('Component: Operation failed', { 
  error: error.message, 
  context: additionalContext 
});
```

### Frontend Logging Implementation

#### Profile Component (`Profile.js`)

```javascript
// Profile loading
logger.info('Profile: Loading user profile', { userId: user.id });

// Profile updates
logger.info('Profile: Profile updated successfully', { userId: user.id, fields: changedFields });

// Image uploads
logger.info('Profile: Image upload initiated', { fileSize: file.size, fileType: file.type });

// Errors
logger.error('Profile: Failed to update profile', { error: error.message, userId: user.id });
```

#### Quiz Results (`TakenQuizzes.js`)

```javascript
// Data fetching
logger.info('TakenQuizzes: Fetching user quiz results', { userId: user.id });

// Results loaded
logger.info('TakenQuizzes: Results loaded successfully', { totalResults: results.length });

// Fetch failures
logger.error('TakenQuizzes: Failed to fetch quiz results', { 
  error: err.message, 
  userId: user.id 
});
```

## Error Handling Patterns

### Backend Error Handling

#### HTTP Exception Handling

```python
# Validation errors
if not image.content_type.startswith('image/'):
    logger.warning(f"Invalid file type uploaded: {image.content_type}")
    raise HTTPException(
        status_code=400, 
        detail="File must be an image"
    )

# Authentication errors
if not user:
    logger.error(f"User not found: {username}")
    raise HTTPException(
        status_code=404, 
        detail="User not found"
    )

# Server errors
try:
    # Process operation
    result = process_operation()
except Exception as e:
    logger.error(f"Operation failed: {str(e)}")
    raise HTTPException(
        status_code=500, 
        detail=f"Internal server error: {str(e)}"
    )
```

#### Database Error Handling

```python
try:
    db.commit()
    logger.info("Database transaction committed successfully")
except Exception as e:
    logger.error(f"Database commit failed: {str(e)}")
    db.rollback()
    raise HTTPException(status_code=500, detail="Database error occurred")
```

### Frontend Error Handling

#### Try-Catch with Logging

```javascript
try {
  const result = await apiCall();
  logger.info('Operation successful', { result });
  return result;
} catch (error) {
  logger.error('API call failed', { 
    error: error.message,
    endpoint: '/api/endpoint',
    status: error.response?.status
  });
  
  // User-friendly error display
  setError('Something went wrong. Please try again.');
  throw error;
}
```

#### State-Based Error Handling

```javascript
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

const handleOperation = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await performOperation();
    logger.info('Operation completed', { result });
    
  } catch (err) {
    const errorMessage = getErrorMessage(err);
    setError(errorMessage);
    logger.error('Operation failed', { error: err.message });
  } finally {
    setLoading(false);
  }
};
```

## Monitoring and Observability

### Log Analysis

#### Backend Log Patterns

```bash
# Search for authentication failures
grep "Failed login attempt" app.log

# Monitor upload errors
grep "Error uploading" app.log

# Check API response times
grep "Route registered" app.log
```

#### Frontend Log Patterns

```javascript
// Get error statistics
logger.getStats().errors;

// Monitor user actions
logger.getStats().events;

// Performance monitoring
logger.performance.mark('operation-start');
// ... operation ...
logger.performance.mark('operation-end');
```

### Error Tracking

#### Critical Errors to Monitor

1. **Authentication Failures**
   - Repeated login attempts
   - Invalid token usage
   - Privilege escalation attempts

2. **File Upload Issues**
   - Large file uploads
   - Invalid file types
   - Storage failures

3. **Database Errors**
   - Connection failures
   - Transaction rollbacks
   - Data inconsistencies

4. **API Failures**
   - High error rates
   - Timeout issues
   - Rate limiting triggers

## Security Considerations

### Sensitive Data Logging

**DO NOT LOG:**
- Passwords or password hashes
- JWT tokens (full tokens)
- Personal identifying information
- Credit card or payment information

**SAFE TO LOG:**
- Usernames (for audit trails)
- File names and sizes
- Timestamps and durations
- Error types and codes

### Log Security

```python
# Safe logging examples
logger.info(f"User {username} logged in")  # ✅ Username OK
logger.info(f"File uploaded: {filename}")  # ✅ Filename OK
logger.warning(f"Invalid token format")    # ✅ No token content

# Avoid logging sensitive data
logger.info(f"Token: {token}")            # ❌ Never log tokens
logger.info(f"Password: {password}")      # ❌ Never log passwords
```

## Performance Monitoring

### Response Time Logging

```python
import time

start_time = time.time()
# ... operation ...
duration = time.time() - start_time
logger.info(f"Operation completed in {duration:.2f}s")
```

### Resource Usage Tracking

```python
# Track file sizes
logger.info(f"Processing image - size: {len(file_content)} bytes")

# Monitor database queries
logger.debug(f"Database query executed: {query_type}")
```

## Best Practices

### Backend Logging

1. **Use structured logging** with consistent formats
2. **Include context** in all log messages
3. **Log at appropriate levels** (don't overuse DEBUG in production)
4. **Rotate log files** to prevent disk space issues
5. **Monitor log file sizes** and retention policies

### Frontend Logging

1. **Log user interactions** for UX analysis
2. **Track API call patterns** for performance optimization
3. **Capture error contexts** for debugging
4. **Respect user privacy** - no sensitive data logging
5. **Use log levels appropriately** for filtering

### General Guidelines

1. **Consistent formatting** across all modules
2. **Meaningful messages** that aid debugging
3. **Proper error categorization** for monitoring
4. **Regular log analysis** for system health
5. **Security-conscious logging** practices

## Troubleshooting Common Issues

### Backend Issues

#### High Log Volume
```python
# Reduce DEBUG logging in production
logging.getLogger().setLevel(logging.INFO)
```

#### Missing Context
```python
# Always include relevant context
logger.error(f"Operation failed for user {user.id}: {str(e)}")
```

### Frontend Issues

#### Console Log Pollution
```javascript
// Use appropriate log levels
logger.debug('Detailed info'); // Only in development
logger.info('General info');   // Production friendly
```

#### Missing Error Details
```javascript
// Include error context
logger.error('API Error', {
  endpoint: url,
  status: response.status,
  message: error.message
});
```

This comprehensive logging and error handling system ensures robust monitoring, debugging capabilities, and security across the entire Quizruption application.