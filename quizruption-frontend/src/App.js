// Main app component
import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';
import QuizListPage from './pages/QuizListPage';
import TriviaPage from './pages/TriviaPage';
import ResultPage from './pages/ResultPage';
import DailyJoke from './components/DailyJoke';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateQuiz from './components/CreateQuiz';
import TurtleChatBot from './components/TurtleChatBot';
import './styles/main.css';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public Route component (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function AppContent() {
  const { login, logout } = useAuth();
  const chatBotRef = useRef(null);

  const handleOpenChat = () => {
    if (chatBotRef.current) {
      chatBotRef.current.openChat();
    }
  };

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login onLogin={login} />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register onRegister={login} />
          </PublicRoute>
        } />
        <Route path="/" element={<Home onOpenChat={handleOpenChat} />} />
        <Route path="/quiz" element={<QuizListPage />} />
        <Route path="/trivia" element={<TriviaPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <CreateQuiz />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/quiz/:id" element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        } />
        <Route path="/result/:id" element={
          <ProtectedRoute>
            <ResultPage />
          </ProtectedRoute>
        } />
        <Route path="/daily-joke" element={<DailyJoke onOpenChat={handleOpenChat} />} />
      </Routes>
      <TurtleChatBot ref={chatBotRef} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
