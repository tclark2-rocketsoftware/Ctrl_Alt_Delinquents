# User Profile Features - Implementation Guide

## Overview
This document describes the comprehensive user profile system that has been implemented in the Quizruption application.

## Features Implemented

### 1. Database Schema Updates
- **Foreign Key Added**: `joke_suggestions.user_id` now has a proper foreign key relationship to `users.id`
- **Migration Script**: `quizruption/database/migrate_jokes.py` created to update existing databases
- **Relationship Mapping**: SQLAlchemy models updated with bidirectional relationships

### 2. Backend API Enhancements

#### Updated Routes
**Authentication Routes** (`quizruption/app/routes/auth.py`):
- `POST /api/auth/register` - Create new user account with secure password hashing
- `POST /api/auth/login` - Authenticate user and return JWT token
- `GET /api/auth/me` - Get current user information
- `PUT /api/auth/profile` - Update user profile information
- `GET /api/auth/profile/{user_id}` - Get public profile of any user
- `GET /api/auth/profile/{user_id}/stats` - **NEW** - Get comprehensive user statistics including:
  - Personality quiz results
  - Trivia quiz results
  - Joke suggestions submitted
  - Quizzes created
  - Personality traits discovered

**Joke Routes** (`quizruption/app/routes/jokes.py`):
- `POST /api/jokes/suggestions` - **UPDATED** - Now accepts `user_id` to track which user made the suggestion

#### Response Format for `/api/auth/profile/{user_id}/stats`
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "display_name": "John Doe",
    "bio": "Quiz enthusiast",
    "location": "New York",
    "website": "https://example.com",
    "profile_image_url": "https://...",
    "created_at": "2025-01-01T00:00:00"
  },
  "stats": {
    "quizzes_created": 5,
    "quizzes_taken": 15,
    "personality_quizzes_taken": 8,
    "trivia_quizzes_taken": 7,
    "personality_traits_discovered": 3,
    "joke_suggestions_submitted": 12,
    "member_since": "2025-01-01T00:00:00"
  },
  "personality_results": [
    {
      "id": 1,
      "quiz_id": 3,
      "personality": "adventurer",
      "created_at": "2025-01-15T10:30:00"
    }
  ],
  "trivia_results": [
    {
      "id": 2,
      "quiz_id": 5,
      "score": 85,
      "created_at": "2025-01-16T14:20:00"
    }
  ],
  "joke_suggestions": [
    {
      "id": 1,
      "suggestion_text": "a joke about programming",
      "used": false,
      "created_at": "2025-01-10T09:15:00"
    }
  ],
  "personality_traits": ["adventurer", "thinker", "creative"],
  "recent_activity": {
    "recent_quizzes": [...]
  }
}
```

### 3. Frontend Implementation

#### Updated Components

**DailyJoke Component** (`quizruption-frontend/src/components/DailyJoke.js`):
- Now uses `useAuth` hook to get current user
- Passes `user_id` when submitting joke suggestions
- Automatically tracks which user made each suggestion

**Profile Page** (`quizruption-frontend/src/pages/Profile.js`):
Displays comprehensive user information in organized sections:

1. **Profile Header**
   - User avatar (or initials)
   - Display name
   - Username
   - Bio
   - Location
   - Website
   - Join date
   - Edit profile button

2. **Statistics Dashboard**
   - Quizzes Created
   - Quizzes Taken
   - Personality Traits Discovered
   - Joke Suggestions Submitted

3. **Personality Quiz Results**
   - Grid of personality types discovered
   - Date of each discovery
   - Visual cards with hover effects

4. **Trivia Quiz Results**
   - List of trivia scores
   - Date of each quiz attempt
   - Visual distinction from personality results

5. **Joke Suggestions**
   - All suggestions submitted by the user
   - Status badges (Used/Pending)
   - Submission dates
   - Italicized text for readability

6. **Personality Traits Summary**
   - Unique personality traits discovered
   - Icon-based display

#### Styling Updates (`quizruption-frontend/src/styles/main.css`)

New CSS classes added:
- `.results-section` - Container for quiz results
- `.results-grid` - Grid layout for result cards
- `.result-card` - Individual result display
- `.personality-result` - Purple-tinted border for personality results
- `.trivia-result` - Pink-tinted border for trivia results
- `.suggestions-section` - Container for joke suggestions
- `.suggestions-list` - Vertical list of suggestions
- `.suggestion-card` - Individual suggestion card with left border
- `.suggestion-badge` - Status indicators (used/pending)

All new components follow the app's glassmorphism design system:
- `rgba(255, 255, 255, 0.1)` backgrounds
- `backdrop-filter: blur(20px)` effects
- Pink-purple gradient accents
- Smooth transitions and hover effects

### 4. User Flow

#### Registration & Login
1. User registers with username, email, and password
2. Password is securely hashed using Werkzeug
3. JWT token generated and stored in localStorage
4. User data stored in AuthContext for app-wide access

#### Taking Quizzes
1. User completes a quiz
2. Result stored with `user_id` in database
3. Personality or trivia score recorded
4. Available in profile stats immediately

#### Submitting Joke Suggestions
1. User views Daily Joke section (Home page)
2. Types suggestion in form
3. If logged in, `user_id` automatically included
4. Suggestion appears in user's profile
5. Status updates when admin marks as "used"

#### Viewing Profile
1. User navigates to Profile page
2. System loads user data via `/api/auth/profile/{user_id}/stats`
3. All sections populate with user's activity
4. Data updates in real-time after new activity

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Joke Suggestions Table (Updated)
```sql
CREATE TABLE joke_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suggestion_text TEXT NOT NULL,
    user_id INTEGER,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## Security Features

1. **Password Hashing**: Uses `werkzeug.security.generate_password_hash`
2. **JWT Authentication**: Secure token-based auth with expiration
3. **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
4. **Foreign Key Constraints**: Data integrity enforced at database level
5. **ON DELETE SET NULL**: Preserves suggestions if user account deleted

## Testing the Implementation

### 1. Test User Registration
```bash
# Using curl or Postman
POST http://localhost:8000/api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "secure_password123"
}
```

### 2. Test Login
```bash
POST http://localhost:8000/api/auth/login
{
  "username": "testuser",
  "password": "secure_password123"
}
```

### 3. Test Profile Stats
```bash
GET http://localhost:8000/api/auth/profile/1/stats
```

### 4. Test Joke Suggestion with User
```bash
POST http://localhost:8000/api/jokes/suggestions
{
  "suggestion_text": "a joke about debugging",
  "user_id": 1
}
```

## Migration Instructions

If you have an existing database, run the migration:

```bash
cd quizruption
python database/migrate_jokes.py
```

This will:
- Add foreign key constraint to `joke_suggestions.user_id`
- Preserve existing suggestion data
- Create necessary indexes

## Future Enhancements

Possible additions to the profile system:
1. **Achievement Badges** - Award badges for milestones
2. **Social Features** - Follow other users, like quizzes
3. **Leaderboards** - Top quiz creators, highest scores
4. **Export Data** - Download personal quiz history
5. **Privacy Settings** - Control profile visibility
6. **Quiz Collections** - Organize favorite quizzes
7. **Notification System** - Alert when suggestion is used

## Troubleshooting

### Issue: Joke suggestions not showing user
**Solution**: Ensure user is logged in and `user_id` is being passed from DailyJoke component

### Issue: Profile stats not loading
**Solution**: Check that backend API is running and user_id is valid

### Issue: Foreign key constraint error
**Solution**: Run `migrate_jokes.py` to update database schema

### Issue: User data not persisting
**Solution**: Check localStorage in browser DevTools, ensure JWT token is valid

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes (token) |
| PUT | `/api/auth/profile` | Update profile | Yes (token) |
| GET | `/api/auth/profile/{user_id}` | Get public profile | No |
| GET | `/api/auth/profile/{user_id}/stats` | Get user stats | No |
| POST | `/api/jokes/suggestions` | Submit joke suggestion | No (optional user_id) |

## Conclusion

The user profile system is now fully integrated with:
- ✅ Secure authentication and registration
- ✅ Comprehensive profile page with stats
- ✅ Personality quiz results tracking
- ✅ Trivia quiz results tracking
- ✅ Joke suggestion history
- ✅ User preferences and information
- ✅ Database relationships properly configured
- ✅ Frontend UI with glassmorphism design

Users can now create accounts, log in, take quizzes, submit joke suggestions, and view their complete quiz journey in a beautifully designed profile page!
