// Main app component
import React, { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import CreatedQuizzes from './pages/CreatedQuizzes';
import TakenQuizzes from './pages/TakenQuizzes';
import JokeSuggestions from './pages/JokeSuggestions';
import CreateQuiz from './components/CreateQuiz';
import EditQuiz from './components/EditQuiz';
import TurtleChatBot from './components/TurtleChatBot';
import ErrorBoundary from './components/ErrorBoundary';
import LoggingDashboard from './components/LoggingDashboard';
import AdminLogin from './components/AdminLogin';
import logger from './utils/logger';
import { isAdminAuthenticated } from './utils/adminAuth';
import './styles/main.css';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public Route component (redirects to home if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/" />;
}

// Admin Route component (redirects to admin login if not authenticated as admin)
function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    const checkAdminAuth = () => {
      const adminAuth = isAdminAuthenticated();
      setIsAdmin(adminAuth);
      setChecking(false);
    };
    checkAdminAuth();
  }, []);

  if (checking) {
    return <div className="loading">Checking admin access...</div>;
  }

  return isAdmin ? children : <Navigate to="/admin/login" />;
}

function AppContent() {
  const { login, logout, user } = useAuth();
  const chatBotRef = useRef(null);

  // Log app initialization
  useEffect(() => {
    logger.info('Application initialized', {
      environment: process.env.NODE_ENV,
      userAuthenticated: !!user
    });
  }, []);

  // Log authentication changes
  useEffect(() => {
    if (user) {
      logger.logUserAction('User Authenticated', { userId: user.id });
    }
  }, [user]);

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
        <Route path="/edit/:id" element={
          <ProtectedRoute>
            <EditQuiz />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/profile/created" element={
          <ProtectedRoute>
            <CreatedQuizzes />
          </ProtectedRoute>
        } />
        <Route path="/profile/taken" element={
          <ProtectedRoute>
            <TakenQuizzes />
          </ProtectedRoute>
        } />
        <Route path="/profile/jokes" element={
          <ProtectedRoute>
            <JokeSuggestions />
          </ProtectedRoute>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/logs" element={
          <AdminRoute>
            <LoggingDashboard />
          </AdminRoute>
        } />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/daily-joke" element={<DailyJoke onOpenChat={handleOpenChat} />} />
      </Routes>
      <TurtleChatBot ref={chatBotRef} />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
