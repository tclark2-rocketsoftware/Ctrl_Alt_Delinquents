@echo off
echo ===============================================
echo Starting Quizruption Frontend (React)
echo ===============================================
echo.

cd /d "%~dp0quizruption-frontend"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from .env.example...
        copy .env.example .env
        echo.
    )
)

echo ===============================================
echo Frontend server starting...
echo App will be available at: http://localhost:3000
echo ===============================================
echo.

REM Start the React development server
call npm start

pause
