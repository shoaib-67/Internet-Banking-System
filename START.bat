@echo off
echo ========================================
echo   Internet Banking System - Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking MySQL...
netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo WARNING: MySQL might not be running on port 3306
    echo Please start XAMPP MySQL service
    pause
)

echo [2/4] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npx -y http-server -p 8080 --cors -c-1"
timeout /t 3 /nobreak >nul

echo [4/4] Opening Browser...
timeout /t 2 /nobreak >nul
start http://127.0.0.1:8080/index.html

echo.
echo ========================================
echo   System Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://127.0.0.1:8080
echo.
echo Login Credentials:
echo   Phone: 01712345678
echo   Account: ACC1001
echo.
echo Press any key to exit...
pause >nul
