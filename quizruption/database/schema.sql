-- SQLite Database Schema for Quizruption with User Authentication

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK(type IN ('trivia', 'personality')) NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT 0,
    personality_tag TEXT,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    user_id INTEGER,
    score INTEGER,
    personality TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Personality content table
CREATE TABLE IF NOT EXISTS personality_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    personality TEXT NOT NULL UNIQUE,
    quote TEXT,
    gif_url TEXT,
    joke TEXT
);

-- Daily jokes table (one joke per calendar day)
CREATE TABLE IF NOT EXISTS daily_jokes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    joke TEXT NOT NULL,
    source TEXT NOT NULL, -- 'openai' or 'fallback'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Joke suggestions table
CREATE TABLE IF NOT EXISTS joke_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suggestion_text TEXT NOT NULL,
    user_id INTEGER,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_quiz_id ON results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- Sample data for personality content
INSERT OR IGNORE INTO personality_content (personality, quote, gif_url, joke) VALUES
('adventurer', 'Life is either a daring adventure or nothing at all.', 'https://media.giphy.com/media/adventure/giphy.gif', 'Why don''t mountains get cold? They wear snow caps!'),
('thinker', 'I think, therefore I am.', 'https://media.giphy.com/media/thinking/giphy.gif', 'Why did the philosopher bring a ladder? To reach higher thoughts!'),
('creative', 'Creativity is intelligence having fun.', 'https://media.giphy.com/media/creative/giphy.gif', 'What do you call a creative artist? A master-piece worker!'),
('leader', 'A leader is one who knows the way, goes the way, and shows the way.', 'https://media.giphy.com/media/leader/giphy.gif', 'Why did the leader go to school? To improve their class!'),
('realist', 'Reality is merely an illusion, albeit a very persistent one.', 'https://media.giphy.com/media/reality/giphy.gif', 'Why did the realist cross the road? Because that''s what happened.');

-- Sample trivia quiz
INSERT INTO quizzes (title, description, type) VALUES
('General Knowledge Quiz', 'Test your general knowledge!', 'trivia');

INSERT INTO questions (quiz_id, text) VALUES
(1, 'What is the capital of France?'),
(1, 'What is 2 + 2?'),
(1, 'Which planet is known as the Red Planet?');

INSERT INTO answers (question_id, text, is_correct) VALUES
(1, 'London', 0),
(1, 'Paris', 1),
(1, 'Berlin', 0),
(1, 'Madrid', 0),
(2, '3', 0),
(2, '4', 1),
(2, '5', 0),
(3, 'Venus', 0),
(3, 'Mars', 1),
(3, 'Jupiter', 0);

-- Sample personality quiz
INSERT INTO quizzes (title, description, type) VALUES
('What''s Your Personality?', 'Discover your unique personality type!', 'personality');

INSERT INTO questions (quiz_id, text) VALUES
(2, 'How do you spend your weekends?'),
(2, 'What''s your approach to problem-solving?'),
(2, 'How do you make decisions?');

INSERT INTO answers (question_id, text, personality_tag) VALUES
(4, 'Exploring new places', 'adventurer'),
(4, 'Reading and thinking', 'thinker'),
(4, 'Creating art or music', 'creative'),
(4, 'Organizing events', 'leader'),
(5, 'Jump right in', 'adventurer'),
(5, 'Analyze all options', 'thinker'),
(5, 'Try creative solutions', 'creative'),
(5, 'Lead a team effort', 'leader'),
(6, 'Trust your gut', 'adventurer'),
(6, 'Use logic and reason', 'thinker'),
(6, 'Follow your passion', 'creative'),
(6, 'Consider team impact', 'leader');
