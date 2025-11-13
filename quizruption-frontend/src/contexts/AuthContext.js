import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in (check for auth token)
    const checkAuthToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await getCurrentUser();
          dispatch({ type: 'LOGIN', payload: user });
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthToken();
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch({ type: 'LOGIN', payload: userData });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    apiLogout(); // Call API logout if needed
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...state.user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  const value = {
    ...state,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};