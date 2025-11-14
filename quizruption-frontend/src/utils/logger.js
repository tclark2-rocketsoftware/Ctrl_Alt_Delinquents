/**
 * Secure Logging System for Frontend
 * 
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR, SECURITY)
 * - PII/sensitive data sanitization
 * - Browser storage with size limits
 * - Optional remote logging
 * - Performance tracking
 * - Error boundary integration
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SECURITY: 4
};

const SENSITIVE_KEYS = [
  'password',
  'token',
  'authToken',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'creditCard',
  'ssn',
  'email', // partially redacted
  'phone'
];

const MAX_LOG_SIZE = 500; // Maximum number of logs to store
const MAX_LOG_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

class Logger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' 
      ? LOG_LEVELS.WARN 
      : LOG_LEVELS.DEBUG;
    this.remoteLoggingEnabled = process.env.REACT_APP_REMOTE_LOGGING === 'true';
    this.remoteLogUrl = process.env.REACT_APP_LOG_ENDPOINT || null;
    this.sessionId = this.generateSessionId();
    this.logs = this.loadLogs();
    this.performanceMarks = new Map();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Sanitize sensitive data from objects
   */
  sanitize(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
        if (lowerKey.includes('email')) {
          // Partially redact email
          sanitized[key] = typeof value === 'string' 
            ? value.replace(/(.{2})(.*)(@.*)/, '$1***$3')
            : '[REDACTED]';
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Create a structured log entry
   */
  createLogEntry(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level: Object.keys(LOG_LEVELS)[level],
      sessionId: this.sessionId,
      message,
      data: this.sanitize(data),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  /**
   * Write log to storage and console
   */
  log(level, message, data = {}) {
    if (level < this.logLevel) {
      return; // Skip logs below current log level
    }

    const logEntry = this.createLogEntry(level, message, data);

    // Console output (with styling in development)
    if (process.env.NODE_ENV !== 'production') {
      const styles = {
        [LOG_LEVELS.DEBUG]: 'color: #888',
        [LOG_LEVELS.INFO]: 'color: #4CAF50',
        [LOG_LEVELS.WARN]: 'color: #FF9800',
        [LOG_LEVELS.ERROR]: 'color: #F44336; font-weight: bold',
        [LOG_LEVELS.SECURITY]: 'color: #9C27B0; font-weight: bold'
      };

      console.log(
        `%c[${logEntry.level}] ${logEntry.timestamp} - ${message}`,
        styles[level],
        data
      );
    }

    // Store in memory
    this.logs.push(logEntry);
    this.trimLogs();
    this.saveLogs();

    // Send to remote if enabled
    if (this.remoteLoggingEnabled && level >= LOG_LEVELS.ERROR) {
      this.sendToRemote(logEntry);
    }
  }

  /**
   * Log level methods
   */
  debug(message, data) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  error(message, data) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  security(message, data) {
    this.log(LOG_LEVELS.SECURITY, message, data);
  }

  /**
   * Performance tracking
   */
  startPerformance(label) {
    this.performanceMarks.set(label, performance.now());
  }

  endPerformance(label) {
    const startTime = this.performanceMarks.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(label);
      this.info(`Performance: ${label}`, { durationMs: duration.toFixed(2) });
      return duration;
    }
    return null;
  }

  /**
   * API call tracking
   */
  logApiCall(method, url, status, duration, error = null) {
    const logData = {
      method,
      url,
      status,
      durationMs: duration,
      timestamp: new Date().toISOString()
    };

    if (error) {
      this.error(`API Error: ${method} ${url}`, { ...logData, error: error.message });
    } else if (status >= 400) {
      this.warn(`API Warning: ${method} ${url}`, logData);
    } else {
      this.debug(`API Success: ${method} ${url}`, logData);
    }
  }

  /**
   * User action tracking (sanitized)
   */
  logUserAction(action, details = {}) {
    this.info(`User Action: ${action}`, this.sanitize(details));
  }

  /**
   * Security event logging
   */
  logSecurityEvent(event, details = {}) {
    this.security(`Security Event: ${event}`, {
      ...this.sanitize(details),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });
  }

  /**
   * Error boundary logging
   */
  logComponentError(error, errorInfo) {
    this.error('React Component Error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack
    });
  }

  /**
   * Storage management
   */
  loadLogs() {
    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        const logs = JSON.parse(stored);
        // Filter out old logs
        const cutoff = Date.now() - MAX_LOG_AGE_MS;
        return logs.filter(log => new Date(log.timestamp).getTime() > cutoff);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
    return [];
  }

  saveLogs() {
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
      // If storage is full, clear old logs
      this.logs = this.logs.slice(-MAX_LOG_SIZE / 2);
      try {
        localStorage.setItem('app_logs', JSON.stringify(this.logs));
      } catch (e) {
        console.error('Failed to save logs after trimming:', e);
      }
    }
  }

  trimLogs() {
    if (this.logs.length > MAX_LOG_SIZE) {
      this.logs = this.logs.slice(-MAX_LOG_SIZE);
    }
  }

  /**
   * Remote logging
   */
  async sendToRemote(logEntry) {
    if (!this.remoteLogUrl) return;

    try {
      await fetch(this.remoteLogUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Failed to send log to remote:', error);
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs() {
    return {
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      logs: this.logs,
      stats: this.getStats()
    };
  }

  /**
   * Get logging statistics
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {}
    };

    Object.keys(LOG_LEVELS).forEach(level => {
      stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
    });

    return stats;
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
    this.info('Logs cleared');
  }

  /**
   * Download logs as JSON file
   */
  downloadLogs() {
    const dataStr = JSON.stringify(this.exportLogs(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${this.sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const logger = new Logger();

// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Uncaught Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason,
    promise: event.promise
  });
});

export default logger;
export { LOG_LEVELS };
