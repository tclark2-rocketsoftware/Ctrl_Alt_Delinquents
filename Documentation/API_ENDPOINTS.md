# Quizruption API Documentation

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Upload Endpoints](#upload-endpoints)
3. [Quiz Endpoints](#quiz-endpoints)
4. [User Profile Endpoints](#user-profile-endpoints)
5. [Error Handling](#error-handling)
6. [Security](#security)

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require a JWT token. Include the token in requests:
- As query parameter: `?token=your_jwt_token`
- In Authorization header: `Bearer your_jwt_token`

## Authentication Endpoints

### POST `/api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2025-01-01T12:00:00Z"
  }
}
```

### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

## Upload Endpoints

### POST `/api/upload/profile-image`
Upload a profile image for the authenticated user.

**Authentication:** Required (JWT token as query parameter)

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Query Parameters:
  - `token`: JWT authentication token
- Form Data:
  - `image`: Image file (JPG, PNG, GIF, WebP)

**File Requirements:**
- Max size: 5MB
- Supported formats: .jpg, .jpeg, .png, .gif, .webp
- Images are automatically resized to 300x300px
- Quality optimized to 85%

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "image_url": "/uploads/profile_images/1_abc123.jpg",
  "filename": "1_abc123.jpg"
}
```

### DELETE `/api/upload/profile-image`
Delete the user's profile image.

**Authentication:** Required

**Query Parameters:**
- `token`: JWT authentication token

**Response:**
```json
{
  "message": "Profile image deleted successfully"
}
```

### POST `/api/upload/personality-image`
Upload an image for personality quiz outcomes.

**Authentication:** Required

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Query Parameters:
  - `token`: JWT authentication token
- Form Data:
  - `image`: Image file
  - `personality_name`: Name/ID of personality outcome

**Response:**
```json
{
  "message": "Personality image uploaded successfully",
  "image_url": "/uploads/personalities/outcome_abc123.jpg",
  "filename": "outcome_abc123.jpg"
}
```

## User Profile Endpoints

### GET `/api/auth/profile/{user_id}`
Get user profile information.

**Authentication:** Required

**Path Parameters:**
- `user_id`: Integer - User ID

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "bio": "Quiz enthusiast",
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "profile_image_url": "/uploads/profile_images/1_abc123.jpg",
  "created_at": "2025-01-01T12:00:00Z"
}
```

### PUT `/api/auth/profile/{user_id}`
Update user profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "display_name": "string",
  "bio": "string",
  "location": "string",
  "website": "string"
}
```

### GET `/api/auth/profile/{user_id}/stats`
Get comprehensive user statistics including quiz results.

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe"
  },
  "stats": {
    "quizzes_created": 5,
    "quizzes_taken": 12,
    "personality_quizzes_taken": 8,
    "trivia_quizzes_taken": 4,
    "personality_traits_discovered": 6,
    "member_since": "2025-01-01T12:00:00Z"
  },
  "personality_results": [
    {
      "id": 1,
      "quiz_id": 2,
      "quiz_title": "What's Your Learning Style?",
      "personality": "Visual Learner",
      "personality_data": {
        "name": "Visual Learner",
        "description": "You learn best through images and spatial understanding",
        "image": "visual_learner.jpg"
      },
      "created_at": "2025-01-01T14:30:00Z"
    }
  ],
  "trivia_results": [
    {
      "id": 2,
      "quiz_id": 3,
      "quiz_title": "Science Trivia",
      "score": 8,
      "total_questions": 10,
      "created_at": "2025-01-01T15:00:00Z"
    }
  ]
}
```

## Quiz Endpoints

### GET `/api/quizzes`
Get all public quizzes.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Personality Quiz",
    "description": "Discover your personality type",
    "type": "personality",
    "created_by": 1,
    "created_at": "2025-01-01T12:00:00Z"
  }
]
```

### GET `/api/quizzes/{quiz_id}`
Get specific quiz with questions and answers.

**Path Parameters:**
- `quiz_id`: Integer - Quiz ID

### POST `/api/quizzes`
Create a new quiz.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "type": "personality" | "trivia",
  "questions": [
    {
      "text": "Question text",
      "answers": [
        {
          "text": "Answer text",
          "is_correct": true,
          "personality_weights": {
            "introvert": 0.8,
            "extrovert": 0.2
          }
        }
      ]
    }
  ],
  "personalities": [
    {
      "name": "Introvert",
      "description": "Enjoys solitude and reflection",
      "image": "introvert.jpg"
    }
  ]
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes:

- `200`: Success
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid or missing authentication token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `413`: Payload Too Large - File size exceeds limit
- `422`: Unprocessable Entity - Validation error
- `500`: Internal Server Error - Server-side error

### Upload-Specific Errors:

- File size too large (>5MB)
- Unsupported file format
- Invalid image data
- Disk space issues

## Security

### Authentication
- JWT tokens expire after 24 hours
- Tokens include user ID and username claims
- Secret key should be environment-specific

### File Upload Security
- File type validation by extension and content-type
- File size limits enforced
- Images are processed and re-encoded for security
- Unique filenames prevent conflicts
- Files stored outside web root when possible

### Data Validation
- All inputs validated using Pydantic models
- SQL injection prevention through ORM
- XSS prevention through proper data sanitization

## Rate Limiting

Consider implementing rate limiting for:
- Authentication endpoints (login/register)
- File upload endpoints
- Quiz creation endpoints

## Logging

All endpoints log:
- Request initiation with user context
- Successful operations with relevant data
- Errors with full context for debugging
- Security events (failed authentication, etc.)

## Development vs Production

### Development Configuration
```
DEBUG=true
LOG_LEVEL=DEBUG
SECRET_KEY=development-key
```

### Production Configuration
```
DEBUG=false
LOG_LEVEL=INFO
SECRET_KEY=secure-random-key-from-environment
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://yourdomain.com
```