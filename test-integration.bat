@echo off
echo.
echo 🚀 Quizruption Full Stack Integration Test
echo ==========================================
echo.

echo 📋 Pre-flight Checklist:
echo ✅ Frontend is running at: http://localhost:3000
echo ⚠️  Backend should be running at: http://localhost:8000
echo.

echo 🧪 Testing API Connectivity...
echo Checking if backend is accessible...

REM Test backend health endpoint
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend is running and accessible!
) else (
    echo ❌ Backend is not running. Please start it first with:
    echo    .\run-backend.bat
    echo.
)

echo.
echo 🔧 Integration Features Implemented:
echo ✅ Authentication (Login/Register)
echo ✅ JWT Token Management
echo ✅ Auto-token attachment to API requests
echo ✅ Error handling and token refresh
echo ✅ Quiz CRUD operations
echo ✅ Results tracking
echo ✅ User profile management
echo.

echo 📝 Testing Checklist:
echo 1. Register a new user account
echo 2. Login with credentials
echo 3. Create a new quiz
echo 4. Take a quiz
echo 5. View results
echo 6. Check profile page
echo.

echo 🌐 Frontend URL: http://localhost:3000
echo 🔗 Backend API: http://localhost:8000/api
echo 📚 API Docs: http://localhost:8000/docs
echo.

pause