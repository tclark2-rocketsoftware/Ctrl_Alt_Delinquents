# Quizruption - Interactive Quiz Web App

An interactive web application that combines Buzzfeed-style personality quizzes and score-based trivia quizzes with personalized results and shareable content.

## Project Structure

### Backend (FastAPI)
```
quizruption/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database connection
│   ├── routes/              # API endpoints
│   │   ├── quizzes.py
│   │   ├── answers.py
│   │   └── results.py
│   ├── services/            # Business logic
│   │   ├── quiz_service.py
│   │   ├── result_service.py
│   │   └── content_service.py
│   ├── utils/               # Utilities
│   │   ├── security.py
│   │   └── share_utils.py
│   └── tests/               # Unit tests
├── database/
│   └── schema.sql           # Database schema
└── requirements.txt
```

### Frontend (React)
```
quizruption-frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── index.js
│   ├── components/
│   │   ├── QuizList.js
│   │   ├── QuizDetail.js
│   │   ├── QuizResult.js
│   │   ├── CreateQuiz.js
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── QuizPage.js
│   │   └── ResultPage.js
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── main.css
│   └── utils/
│       └── helpers.js
└── package.json
```

## Features

### Quiz Types
- **Trivia Quizzes**: Score-based with correct/incorrect answers
- **Personality Quizzes**: Answer-mapped personality outcomes

### Core Functionality
1. **Quiz Management**
   - Create, view, update, delete quizzes
   - Two quiz types: trivia and personality
   - Support for images and descriptions

2. **Quiz Participation**
   - Interactive UI with progress indicators
   - Optional timed quizzes
   - Real-time answer submission

3. **Results & Personalization**
   - Trivia: Score summary
   - Personality: Description + daily content (quote/GIF/joke)
   - Shareable result cards

4. **Daily Humor Feature**
   - Personality-based quotes, jokes, memes, GIFs
   - Dynamic content from APIs or database

5. **Security**
   - JWT-based authentication
   - Role-based access control
   - Rate limiting and input validation

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd quizruption
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
sqlite3 quizruption.db < database/schema.sql
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd quizruption-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Quizzes
- `POST /api/quizzes` - Create a quiz
- `GET /api/quizzes` - List all quizzes
- `GET /api/quizzes/{id}` - Get quiz by ID
- `PUT /api/quizzes/{id}` - Update quiz
- `DELETE /api/quizzes/{id}` - Delete quiz

### Answers
- `POST /api/answers/submit` - Submit quiz answers

### Results
- `GET /api/results/{id}` - Get result by ID
- `GET /api/results/quiz/{quiz_id}` - Get all results for a quiz
- `GET /api/results/user/{user_id}` - Get all results for a user

## Testing

### Backend Tests
```bash
cd quizruption
pytest app/tests/
```

### Frontend Tests
```bash
cd quizruption-frontend
npm test
```

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT (python-jose)
- **Testing**: pytest

### Frontend
- **Framework**: React
- **Styling**: CSS (TailwindCSS ready)
- **HTTP Client**: Axios
- **Routing**: React Router

## Database Schema

- **quizzes**: Quiz metadata
- **questions**: Quiz questions
- **answers**: Answer options with correct/personality mappings
- **results**: User quiz results
- **personality_content**: Personality-based daily content

## Future Enhancements

- AI-powered quiz generation
- Social media integration
- User authentication and profiles
- Quiz analytics dashboard
- Mobile app
- Real-time multiplayer quizzes

## License

MIT License

## Contributors

Ctrl_Alt_Delinquents Team
