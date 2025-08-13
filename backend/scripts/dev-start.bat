@echo off
echo Starting Ozone Staking Backend...
echo.

REM Check if in backend directory
if not exist "server.js" (
    echo Error: server.js not found. Make sure you're in the backend directory.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting server on http://localhost:3000
echo Health check: http://localhost:3000/health
echo API base: http://localhost:3000/api/v1
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js
