@echo off
echo ========================================
echo    OZONE STAKING - DEVELOPMENT SETUP
echo ========================================
echo.

REM Check if we're in the root directory
if not exist "backend" (
    echo Error: backend folder not found. Make sure you're in the project root directory.
    pause
    exit /b 1
)

if not exist "web" (
    echo Error: web folder not found. Make sure you're in the project root directory.
    pause
    exit /b 1
)

echo [1/4] Installing Backend Dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed.
)

echo.
echo [2/4] Installing Frontend Dependencies...
cd ..\web
if not exist "node_modules" (
    echo Installing frontend packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed.
)

echo.
echo [3/4] Starting Backend Server...
cd ..\backend
start "Backend Server" cmd /k "echo Starting Backend Server on http://localhost:3000 && node server.js"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting Frontend Development Server...
cd ..\web
start "Frontend Server" cmd /k "echo Starting Frontend Server on http://localhost:3001 && npm start"

echo.
echo ========================================
echo    SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend:    http://localhost:3001
echo.
echo Backend Health: http://localhost:3000/health
echo API Docs:       http://localhost:3000/api/v1
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
