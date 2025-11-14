
# Quizruption - Interactive Quiz Platform

A comprehensive full-stack quiz application featuring personality quizzes, trivia games, user profiles, and comprehensive logging and monitoring systems.

## 🚀 Features

### Core Features
- **BuzzFeed-Style Personality Quizzes** with weighted scoring and visual outcomes
- **Trivia Quizzes** with multiple-choice questions and scoring
- **User Profiles** with image upload and profile customization
- **Quiz Results Tracking** with enhanced visual display and personality outcomes
- **Authentication System** with JWT tokens and user management

### Advanced Features
- **Image Upload System** for profile pictures and personality outcomes
- **Comprehensive Logging** with frontend and backend monitoring
- **Admin Dashboard** with logging management and system monitoring
- **Error Handling** with graceful fallbacks and user feedback
- **Responsive Design** with mobile-friendly interface

### Technical Features
- **RESTful API** with comprehensive documentation
- **Database Management** with SQLite (dev) and PostgreSQL (prod) support
- **Security Features** including file validation and authentication
- **Performance Optimization** with image processing and caching
- **Deployment Ready** with Docker and production configurations

## 📁 Project Structure

```
Ctrl_Alt_Delinquents/
├── quizruption/                    # Backend FastAPI application
│   ├── app/
│   │   ├── main.py                # FastAPI application entry point
│   │   ├── models.py              # Database models
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── database.py            # Database configuration
│   │   ├── routes/                # API route handlers
│   │   │   ├── auth.py           # Authentication routes
│   │   │   ├── quizzes.py        # Quiz management routes
│   │   │   ├── results.py        # Quiz results routes
│   │   │   ├── answers.py        # Answer handling routes
│   │   │   └── uploads.py        # Image upload routes
│   │   ├── services/              # Business logic services
│   │   │   ├── quiz_service.py   # Quiz management
│   │   │   ├── result_service.py # Result calculation
│   │   │   └── content_service.py# Content management
│   │   └── utils/                # Utility functions
│   ├── database/                  # Database management scripts
│   │   ├── init_db.py           # Database initialization
│   │   ├── verify.py            # Database verification
│   │   └── schema.sql           # Database schema
│   ├── uploads/                  # File upload directory
│   └── requirements.txt         # Python dependencies
├── quizruption-frontend/         # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── CreateQuiz.js   # Quiz creation interface
│   │   │   ├── QuizResult.js   # Quiz results display
│   │   │   ├── Login.js        # User authentication
│   │   │   ├── Register.js     # User registration
│   │   │   ├── AdminLogin.js   # Admin authentication
│   │   │   ├── LoggingDashboard.js # Admin logging dashboard
│   │   │   └── ErrorBoundary.js # Error handling
│   │   ├── pages/               # Application pages
│   │   │   ├── Profile.js      # User profile management
│   │   │   ├── TakenQuizzes.js # Quiz results history
│   │   │   ├── CreatedQuizzes.js # User's created quizzes
│   │   │   └── Dashboard.js    # Main dashboard
│   │   ├── services/           # API integration
│   │   │   ├── api.js         # API client functions
│   │   │   └── apiInterceptor.js # Request/response handling
│   │   ├── utils/              # Utility functions
│   │   │   ├── logger.js       # Frontend logging system
│   │   │   ├── adminAuth.js    # Admin authentication
│   │   │   └── documentationContent.js # Help content
│   │   ├── contexts/           # React contexts
│   │   │   └── AuthContext.js  # Authentication state
│   │   └── styles/
│   │       └── main.css        # Application styles
│   └── package.json            # Node.js dependencies
├── Documentation/               # Comprehensive documentation
│   ├── API_ENDPOINTS.md        # API documentation
│   ├── ERROR_HANDLING_LOGGING.md # Logging and error handling guide
│   ├── DEPLOYMENT_GUIDE.md     # Deployment instructions
│   └── Project_Overview.md     # Project overview
├── run-quizruption.bat         # Windows startup script
├── run-backend.bat             # Backend startup script
├── run-frontend.bat            # Frontend startup script
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** for version control

### One-Command Setup

For the fastest setup, use our automated startup script:

**Windows:**
```powershell
.\run-quizruption.bat
```

**Linux/Mac:**
```bash
chmod +x run-quizruption.sh
./run-quizruption.sh
```

This will:
1. Set up both backend and frontend environments
2. Install all dependencies
3. Initialize the database
4. Start both servers automatically

### Manual Setup

If you prefer manual setup or need to troubleshoot:

#### Backend Setup

1. **Navigate to backend directory:**
   ```powershell
   cd quizruption
   ```

2. **Create and activate virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows
   # source venv/bin/activate    # Linux/Mac
   ```

3. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

   ### Backend Environment Variables

   The FastAPI backend reads a `.env` file (python-dotenv) located in `quizruption/`. Copy `quizruption/.env.example` to `quizruption/.env` and adjust:

   | Variable | Purpose | Default |
   |----------|---------|---------|
   | BACKEND_HOST | Interface uvicorn binds to | 0.0.0.0 |
   | BACKEND_PORT | Port uvicorn listens on | 8000 |
   | SECRET_KEY | JWT signing key (change in production) | dev-insecure-change-me |
   | JWT_ALGORITHM | JWT algorithm | HS256 |
   | ACCESS_TOKEN_EXPIRE_MINUTES | Token lifetime | 30 |
   | CORS_ORIGINS | Comma list or * | * |
   | SQLITE_URL | Override DB URL | sqlite:///./quizruption.db |
   | OPENAI_API_KEY | Enables AI joke generation | (unset) |

   Example (PowerShell, one-off without editing file):
   ```powershell
   $env:BACKEND_HOST="10.0.0.15"
   $env:BACKEND_PORT="8081"
   uvicorn app.main:app --host $env:BACKEND_HOST --port $env:BACKEND_PORT
   ```

   ### Frontend Environment Variables

   Create or edit `quizruption-frontend/.env` using either a direct URL or host/port/path composition (Create React App injects at build time):

   Option A (single URL):
   ```
   REACT_APP_API_URL=http://10.0.0.15:8081/api
   ```

   Option B (components):
   ```
   REACT_APP_API_HOST=10.0.0.15
   REACT_APP_API_PORT=8081
   REACT_APP_API_PATH=/api
   ```

   If both are set, `REACT_APP_API_URL` takes priority. After changes, restart `npm start` or rebuild.

   ### Running With Scripts

   Backend:
   ```powershell
   ./run-backend.bat   # Uses .env automatically (python-dotenv) and BACKEND_HOST/BACKEND_PORT if set
   ```

   Frontend:
   ```powershell
   ./run-frontend.bat  # Uses .env variables for API base URL
   ```


## Usage

5. **Start backend server:**
   ```powershell
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory:**
   ```powershell
   cd quizruption-frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start development server:**
   ```powershell
   npm start
   ```

### Access the Application

Once both servers are running:

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:8000  
- **API Documentation:** http://localhost:8000/docs
- **Admin Dashboard:** http://localhost:3000/admin (requires admin login)

## 🎯 Usage Guide

### For Users

1. **Create Account:** Register with username, email, and password
2. **Take Quizzes:** Choose from personality or trivia quizzes
3. **View Results:** See your personality outcomes with images and descriptions
4. **Manage Profile:** Upload profile picture and customize your information
5. **Track History:** Review all quizzes taken with detailed results

### For Quiz Creators

1. **Create Personality Quiz:**
   - Add questions with multiple choice answers
   - Set personality weights for each answer
   - Upload images and descriptions for personality outcomes
   - Publish for others to take

2. **Create Trivia Quiz:**
   - Add questions with correct/incorrect answers
   - Set difficulty and category
   - Review participant scores and statistics

### For Administrators

1. **Access Admin Panel:** Login with admin credentials
2. **Monitor System:** View comprehensive logging dashboard
3. **User Management:** Review user activity and statistics
4. **System Health:** Monitor errors and performance metrics

## 🛠️ Configuration

### Environment Variables

#### Backend (.env in quizruption/)
```env
SECRET_KEY=your-secure-secret-key
DATABASE_URL=sqlite:///./quizruption.db
MAX_FILE_SIZE=5242880
LOG_LEVEL=INFO
DEBUG=true
```

#### Frontend (.env in quizruption-frontend/)
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_LOG_LEVEL=info
REACT_APP_ENVIRONMENT=development
```

## 🔧 API Documentation

### Quick API Overview

The REST API provides comprehensive endpoints for:

- **Authentication:** `/api/auth/` - User registration, login, profile management
- **Quizzes:** `/api/quizzes/` - Quiz creation, retrieval, management
- **Results:** `/api/results/` - Quiz submissions, result calculations
- **Uploads:** `/api/upload/` - Image upload for profiles and quiz content

### Complete Documentation

For detailed API documentation including request/response schemas, authentication requirements, and examples:

- **Interactive Docs:** http://localhost:8000/docs (when backend is running)
- **Written Guide:** [Documentation/API_ENDPOINTS.md](Documentation/API_ENDPOINTS.md)

## 📊 Features Deep Dive

### Personality Quiz System

Our BuzzFeed-style personality quiz system includes:

- **Weighted Scoring:** Each answer contributes different weights to personality outcomes
- **Visual Results:** Personality outcomes include custom images and detailed descriptions  
- **Result Tracking:** Users can see their personality history with visual timelines
- **Retake Capability:** Users can retake quizzes and see updated results

### Image Upload System

Secure image handling with:

- **File Validation:** Supports JPG, PNG, GIF, WebP with size limits
- **Image Processing:** Automatic resizing and optimization using PIL/Pillow
- **Secure Storage:** Files stored with unique names and proper permissions
- **Profile Integration:** Profile pictures integrate seamlessly with user profiles

### Comprehensive Logging

Both frontend and backend include detailed logging:

- **Backend Logging:** Python logging with file rotation and structured output
- **Frontend Logging:** JavaScript logging with error tracking and user analytics
- **Admin Dashboard:** Real-time log monitoring and system health metrics
- **Error Tracking:** Comprehensive error capture with context and stack traces

## 🚧 Development

### Running Tests

```powershell
# Backend tests
cd quizruption
python -m pytest

# Frontend tests  
cd quizruption-frontend
npm test
```

### Database Management

```powershell
# Initialize fresh database
python database\init_db.py

# Verify database integrity
python database\verify.py

# View database contents
python database\inspect.py
```

### Development vs Production

The application is configured for easy switching between development and production:

- **Development:** SQLite database, detailed logging, CORS enabled
- **Production:** PostgreSQL support, optimized logging, security hardening

See [Documentation/DEPLOYMENT_GUIDE.md](Documentation/DEPLOYMENT_GUIDE.md) for production deployment.

## 📚 Documentation

### Complete Documentation Set

- **[API Endpoints](Documentation/API_ENDPOINTS.md)** - Complete API reference
- **[Error Handling & Logging](Documentation/ERROR_HANDLING_LOGGING.md)** - Logging architecture and error patterns
- **[Deployment Guide](Documentation/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Project Overview](Documentation/Project_Overview.md)** - High-level project architecture

### Frontend Documentation

- **[Logging System](quizruption-frontend/LOGGING_SYSTEM.md)** - Frontend logging architecture
- **[Admin Guide](quizruption-frontend/ADMIN_LOGIN_GUIDE.md)** - Admin authentication and dashboard
- **[Quick Start](quizruption-frontend/LOGGING_QUICKSTART.md)** - Quick logging integration guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add appropriate logging to new features  
- Update documentation for API changes
- Test both backend and frontend thoroughly
- Ensure mobile responsiveness for UI changes

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Verify Python virtual environment
.\venv\Scripts\python.exe --version

# Check database initialization
python database\verify.py
```

#### Frontend Won't Start  
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
npm install

# Check for port conflicts
netstat -ano | findstr :3000
```

#### Database Issues
```powershell
# Reset database completely
python database\init_db.py

# Check database file permissions
ls -la quizruption.db
```

### Getting Help

- **Issue Tracker:** [GitHub Issues](https://github.com/tclark2-rocketsoftware/Ctrl_Alt_Delinquents/issues)
- **Documentation:** Check the comprehensive docs in `Documentation/`
- **Logs:** Check `app.log` for backend issues, browser console for frontend issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Built with FastAPI for robust backend API development
- React frontend with modern hooks and context patterns  
- Comprehensive logging and monitoring systems
- Security-first approach with proper authentication and file handling
- Mobile-responsive design for cross-platform compatibility

---

**Happy Quizzing! 🧠✨**

Joke generation order:
1. If an OpenAI API key is provided via `REACT_APP_OPENAI_KEY`, a two-sentence AI generated joke is requested.
2. If no key or the request fails, a fallback combinational generator produces a light, clean two-sentence tech/general humor joke.

To enable AI jokes, create a `.env` file in `quizruption-frontend/`:
```
REACT_APP_OPENAI_KEY=sk-YourKeyHere
```
Restart the frontend dev server after adding the environment variable.

The joke plus selected GIF URL are stored in `localStorage` (`dailyJoke_v1`) and will only refresh the next calendar day.

Frontend quick start (if not already documented):
```powershell
cd quizruption-frontend
npm install
npm start
```

Then open: `http://localhost:3000/daily-joke`

### Daily Joke (Backend API)

The backend exposes a daily joke endpoint at `GET /api/jokes/daily` (no GIF returned yet; GIFs are currently client-side curated).

Behavior:
1. On first request each calendar day (server time), it will attempt to generate a two-sentence family-friendly joke using OpenAI Chat Completions (model `gpt-4o-mini`).
2. If no API key (`OPENAI_API_KEY`) is set or the request fails, it falls back to a local combinational generator.
3. The chosen joke is persisted in the `daily_jokes` table and subsequent requests that day return the cached joke with `cached: true`.

Environment variable (set before starting the server):
```powershell
$env:OPENAI_API_KEY="sk-YourKeyHere"
```

Example request (PowerShell):
```powershell
Invoke-RestMethod http://localhost:8000/api/jokes/daily
```

Sample JSON response:
```json
{
   "date": "2025-11-13",
   "joke": "A programmer ships to production on Friday and the logs start flirting back. The backlog quietly grows three new mysterious tickets.",
   "source": "fallback",
   "cached": false
}
```

Running backend (FastAPI):
```powershell
cd quizruption/app
uvicorn app.main:app --reload --port 8000
```

Tests for the endpoint located at `quizruption/app/tests/test_jokes.py`.


## License

MIT
