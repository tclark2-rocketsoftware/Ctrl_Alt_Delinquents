@echo off
echo ===============================================
echo Starting Quizruption - Full Stack Application
echo ===============================================
echo.
echo This will open two terminal windows:
echo 1. Backend (FastAPI) - http://localhost:8000
echo 2. Frontend (React) - http://localhost:3000
echo.
echo Press any key to continue...
pause >nul

REM Start backend in new window
start "Quizruption Backend" cmd /k "%~dp0run-backend.bat"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Quizruption Frontend" cmd /k "%~dp0run-frontend.bat"

echo.
echo ===============================================
echo Both servers are starting in separate windows
echo ===============================================
echo.
echo Backend: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Close this window or press any key to exit...
pause >nul
