@echo off
echo ===============================================
echo Starting Quizruption Backend (FastAPI)
echo ===============================================
echo.

cd /d "%~dp0quizruption"

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    py -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
echo Checking dependencies...
pip install -r requirements.txt --quiet

echo.
echo ===============================================
echo Backend server starting...
echo API will be available at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ===============================================
echo.

REM Start the FastAPI server
uvicorn app.main:app --reload

pause
