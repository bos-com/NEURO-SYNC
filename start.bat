@echo off
echo ========================================
echo   Starting NeuroSync Project
echo ========================================
echo.

REM Start server in new window
echo Starting Server on port 5001...
start "NeuroSync Server" cmd /k "cd server && npm start"

REM Wait a bit for server to start
timeout /t 3 /nobreak >nul

REM Start client in new window
echo Starting Client on port 3000...
start "NeuroSync Client" cmd /k "cd client && npm start"

echo.
echo ========================================
echo   Both services are starting!
echo ========================================
echo Server: http://localhost:5001
echo Client: http://localhost:3000
echo.
echo Press any key to exit this window (services will keep running)...
pause >nul

