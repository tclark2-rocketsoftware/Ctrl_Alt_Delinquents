// Axios setup for API calls
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const getQuizResults = async (quizId) => {
  const response = await api.get(`/results/quiz/${quizId}`);
  return response.data;
};

export const getUserResults = async (userId) => {
  const response = await api.get(`/results/user/${userId}`);
  return response.data;
};

export default api;
