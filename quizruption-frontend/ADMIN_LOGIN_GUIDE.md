# Admin Authentication for Logging Dashboard

## Overview
The logging dashboard is now protected with admin authentication. Only users with admin credentials can access the system logs.

## Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Important:** Change these credentials in production! Update them in `src/components/AdminLogin.js`

## Access Points

### Admin Login Page
- **URL:** `http://localhost:3000/admin/login`
- **Purpose:** Authentication gateway for admin access
- **Features:**
  - Secure credential validation
  - Session management (24-hour expiry)
  - Failed login attempt logging
  - Redirect to logging dashboard on success

### Logging Dashboard
- **URL:** `http://localhost:3000/admin/logs`
- **Access:** Requires admin authentication
- **Auto-redirect:** Unauthenticated users are redirected to `/admin/login`
- **Features:**
  - View all application logs
  - Filter by log level (DEBUG, INFO, WARN, ERROR, SECURITY)
  - Search logs by keyword
  - Export/download logs
  - Real-time statistics
  - Auto-refresh option
  - **Admin logout button** in header

## How It Works

### 1. Admin Login Flow
```
User visits /admin/logs
    ↓
Not authenticated? → Redirect to /admin/login
    ↓
Enter admin credentials
    ↓
Credentials valid? → Create admin session
    ↓
Store session in localStorage
    ↓
Redirect to /admin/logs
    ↓
Access granted ✓
```

### 2. Session Management
- **Storage:** Admin session stored in localStorage
- **Expiry:** 24 hours from login time
- **Auto-check:** Session validity checked on every dashboard access
- **Security logging:** All login/logout events are logged

### 3. Authentication Components

#### AdminLogin Component (`src/components/AdminLogin.js`)
- Provides login form UI
- Validates credentials against hardcoded admin credentials
- Creates admin session on success
- Logs security events (success/failure)
- Redirects to logging dashboard

#### adminAuth Utilities (`src/utils/adminAuth.js`)
- `isAdminAuthenticated()` - Check if admin is logged in
- `getAdminSession()` - Get current admin session data
- `logoutAdmin()` - Clear admin session
- `extendAdminSession()` - Refresh session timestamp

#### AdminRoute Component (`src/App.js`)
- Protected route wrapper for admin pages
- Checks authentication before rendering
- Redirects to login if not authenticated
- Shows loading state during auth check

## Security Features

### 1. Credential Validation
- Credentials validated client-side (for demo purposes)
- **Production:** Should validate against backend API

### 2. Session Expiry
- Sessions expire after 24 hours
- Automatic logout when session expires
- Session timestamp refreshed on activity (optional)

### 3. Security Event Logging
- ✅ Admin login success
- ❌ Admin login failure
- 🚪 Admin logout
- All events include:
  - Username
  - Timestamp
  - IP address (if available)
  - Reason (for failures)

### 4. Protected Routes
- Logging dashboard only accessible to authenticated admins
- Automatic redirect to login page
- No direct URL access without authentication

## Usage Instructions

### For Admins

1. **Access Logging Dashboard:**
   ```
   Navigate to: http://localhost:3000/admin/logs
   ```

2. **Login:**
   - You'll be redirected to `/admin/login`
   - Enter username: `admin`
   - Enter password: `admin123`
   - Click "Login as Admin"

3. **View Logs:**
   - After successful login, you'll see the logging dashboard
   - Use filters and search to find specific logs
   - Download logs for offline analysis
   - Click "Logout" in header when done

4. **Logout:**
   - Click the "🚪 Logout" button in the dashboard header
   - You'll be redirected to the login page
   - Session will be cleared

### Session Behavior

- **Active Session:** Can access dashboard directly
- **Expired Session:** Redirected to login page
- **Multiple Tabs:** Session shared across tabs (localStorage)
- **Browser Close:** Session persists until expiry

## Production Recommendations

### 1. Move Credentials to Backend
Replace client-side validation with backend API:

```javascript
// Instead of hardcoded credentials
const response = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

if (response.ok) {
  const { token } = await response.json();
  // Store JWT token instead of session object
}
```

### 2. Use JWT Tokens
- Store JWT token instead of session object
- Include token in API requests
- Verify token on backend for each request

### 3. Environment Variables
Store credentials in `.env` file:

```
REACT_APP_ADMIN_USERNAME=admin
REACT_APP_ADMIN_PASSWORD=SecurePassword123!
```

### 4. Rate Limiting
Add failed login attempt tracking:
- Limit login attempts (e.g., 5 attempts per 15 minutes)
- Lock account after excessive failures
- Display CAPTCHA after failed attempts

### 5. HTTPS Only
- Use HTTPS in production
- Set secure cookies
- Enable HSTS headers

### 6. Multi-Factor Authentication (MFA)
Consider adding:
- TOTP (Time-based One-Time Password)
- SMS verification
- Email verification codes

## File Structure

```
src/
├── components/
│   ├── AdminLogin.js          # Admin login page component
│   └── LoggingDashboard.js    # Logging dashboard (protected)
├── utils/
│   ├── adminAuth.js           # Admin authentication utilities
│   └── logger.js              # Logging system
└── App.js                     # Routes with AdminRoute protection
```

## Troubleshooting

### Issue: "Invalid admin credentials"
- **Solution:** Verify username is `admin` and password is `admin123`
- Check for typos or extra spaces

### Issue: Redirected to login after successful login
- **Solution:** Clear localStorage and try again
- Check browser console for errors
- Verify session hasn't expired

### Issue: Session expires too quickly
- **Solution:** Adjust expiry time in `adminAuth.js`:
  ```javascript
  // Change from 24 hours to 72 hours
  if (hoursSinceLogin > 72) {
  ```

### Issue: Can't access admin login page
- **Solution:** Ensure frontend is running on correct port
- Navigate to exact URL: `http://localhost:3000/admin/login`

## Testing Checklist

- [ ] Can access `/admin/login` page
- [ ] Invalid credentials show error message
- [ ] Valid credentials grant access to dashboard
- [ ] Failed login attempts are logged
- [ ] Successful login is logged
- [ ] Logout button clears session
- [ ] After logout, cannot access dashboard
- [ ] Session expires after 24 hours
- [ ] Directly accessing `/admin/logs` redirects to login when not authenticated
- [ ] Admin username displays in dashboard header

## Next Steps

1. **Test the admin login:**
   ```
   Visit: http://localhost:3000/admin/login
   Login with: admin / admin123
   ```

2. **Verify logging dashboard access:**
   - Check that you can see all logs
   - Test filtering and searching
   - Confirm logout works

3. **Update credentials:**
   - Change default password in `AdminLogin.js`
   - Consider moving to environment variables

4. **Plan backend integration:**
   - Design admin authentication API
   - Implement JWT token system
   - Add database for admin users
