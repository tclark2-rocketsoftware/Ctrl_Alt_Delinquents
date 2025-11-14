@echo off
echo ===============================================
echo Starting Quizruption Backend (FastAPI)
echo ===============================================
echo.

cd /d "%~dp0quizruption"

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Note: Using direct Python path due to activation policy...
    set PYTHON_PATH=venv\Scripts\python.exe
) else (
    set PYTHON_PATH=python
)

REM Check if requirements are installed
echo Checking dependencies...
venv\Scripts\pip.exe install --upgrade pip
venv\Scripts\pip.exe install --only-binary :all: -r requirements.txt || venv\Scripts\pip.exe install -r requirements.txt
echo. 

echo.
echo ===============================================
echo Backend server starting...
if "%BACKEND_HOST%"=="" set BACKEND_HOST=0.0.0.0
if "%BACKEND_PORT%"=="" set BACKEND_PORT=8000
echo API will be available at: http://%BACKEND_HOST%:%BACKEND_PORT%
echo API Docs: http://%BACKEND_HOST%:%BACKEND_PORT%/docs
echo ===============================================
echo.

REM Start the FastAPI server
if exist "venv\Scripts\uvicorn.exe" (
    rem Start uvicorn with configurable host/port
    venv\Scripts\uvicorn.exe app.main:app --host %BACKEND_HOST% --port %BACKEND_PORT% --reload
) else (
    echo ERROR: uvicorn not found! Dependencies may not have installed correctly.
    echo Please check the error messages above.
    exit /b 1
)
