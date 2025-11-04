@echo off
echo ========================================
echo    Room Booking System - Frontend
echo ========================================
echo.
echo Starting development server...
echo Frontend will run at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
call npm run dev

pause

