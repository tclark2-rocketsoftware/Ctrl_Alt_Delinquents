import axios from 'axios';
import logger from '../utils/logger';

/**
 * Enhanced API interceptor with secure logging.
 * Base URL resolution order:
 * 1. REACT_APP_API_URL (build-time env)
 * 2. Relative '/api' (same-origin backend behind reverse proxy)
 *
 * Removes hardcoded localhost so production doesn't accidentally call a dev machine.
 */

const API_BASE_URL = (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    config.metadata = { startTime };

    // Log API request (sanitized)
    logger.debug('API Request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!config.headers?.Authorization,
      params: config.params
    });

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logger.error('API Request Error', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    
    // Log successful API response
    logger.logApiCall(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status,
      duration
    );

    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;

    const status = error.response?.status || 0;
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';

    // Log failed API response
    logger.logApiCall(method, url, status, duration, error);

    // Log security events for specific error codes
    if (status === 401) {
      logger.logSecurityEvent('Unauthorized Access Attempt', {
        url,
        method,
        timestamp: new Date().toISOString()
      });
    } else if (status === 403) {
      logger.logSecurityEvent('Forbidden Access Attempt', {
        url,
        method,
        timestamp: new Date().toISOString()
      });
    } else if (status === 429) {
      logger.logSecurityEvent('Rate Limit Exceeded', {
        url,
        method,
        timestamp: new Date().toISOString()
      });
    }

    return Promise.reject(error);
  }
);

export default api;
