// Axios setup for API calls
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.params = { ...config.params, token };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  if (response.data.access_token) {
    localStorage.setItem('authToken', response.data.access_token);
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.access_token) {
    localStorage.setItem('authToken', response.data.access_token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

// Profile endpoints
export const updateUserProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
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

export default api;
