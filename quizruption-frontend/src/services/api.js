// Axios setup for API calls
import apiInterceptor from './apiInterceptor';

// Use the enhanced API instance with logging
const api = apiInterceptor;

// Quiz endpoints
export const getQuizzes = async (type = null) => {
  const params = type ? { quiz_type: type } : {};
  const response = await api.get('/quizzes', { params });
  return response.data;
};

export const getQuiz = async (id) => {
  const response = await api.get(`/quizzes/${id}`);
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await api.post('/quizzes', quizData);
  return response.data;
};

export const updateQuiz = async (id, quizData) => {
  const response = await api.put(`/quizzes/${id}`, quizData);
  return response.data;
};

export const deleteQuiz = async (id) => {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
};

// Answer submission
export const submitQuiz = async (submission) => {
  const response = await api.post('/answers/submit', submission);
  return response.data;
};

// Results endpoints
export const getResult = async (id) => {
  const response = await api.get(`/results/${id}`);
  return response.data;
};

// Authentication endpoints
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await api.get('/auth/me', { params: { token } });
  return response.data;
};

// Profile endpoints
export const updateUserProfile = async (profileData) => {
  const token = localStorage.getItem('authToken');
  const response = await api.put('/auth/profile', profileData, {
    params: { token }
  });
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/auth/profile/${userId}`);
  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await api.get(`/auth/profile/${userId}/stats`);
  return response.data;
};

export const getQuizResults = async (quizId) => {
  const response = await api.get(`/results/quiz/${quizId}`);
  return response.data;
};

export const getUserResults = async (userId) => {
  const response = await api.get(`/results/user/${userId}`);
  return response.data;
};

// Chat endpoints
export const sendChatMessage = async (message, conversationHistory = null) => {
  const response = await api.post('/chat', {
    message,
    conversation_history: conversationHistory
  });
  return response.data;
};

export default api;
