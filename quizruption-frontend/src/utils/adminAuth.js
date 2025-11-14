// Admin authentication utilities

/**
 * Check if user has admin access
 * @returns {boolean} True if admin is logged in
 */
export const isAdminAuthenticated = () => {
  try {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) return false;

    const session = JSON.parse(adminSession);
    
    // Check if session exists and is valid
    if (!session || !session.isAdmin) return false;

    // Optional: Check if session is expired (e.g., 24 hours)
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
    
    // Session expires after 24 hours
    if (hoursSinceLogin > 24) {
      logoutAdmin();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking admin auth:', error);
    return false;
  }
};

/**
 * Get current admin session data
 * @returns {Object|null} Admin session data or null
 */
export const getAdminSession = () => {
  try {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) return null;
    return JSON.parse(adminSession);
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
};

/**
 * Logout admin and clear session
 */
export const logoutAdmin = () => {
  localStorage.removeItem('adminSession');
};

/**
 * Extend admin session by updating login time
 */
export const extendAdminSession = () => {
  const session = getAdminSession();
  if (session && session.isAdmin) {
    session.loginTime = new Date().toISOString();
    localStorage.setItem('adminSession', JSON.stringify(session));
  }
};
