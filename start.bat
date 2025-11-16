@echo off
REM Chef Chatter - Start both backend and frontend
REM This script opens two command windows to run backend and frontend

echo.
echo ==================================
echo  Chefs Chatter - Startup Script
echo ==================================
echo.

set PROJECTDIR=%~dp0
set BACKENDDIR=%PROJECTDIR%backend

echo Starting Backend Server...
echo Press Ctrl+C in any window to stop that server

REM Open new window for backend
start "Chef Chatter Backend" cmd /k "cd %BACKENDDIR% && node server.js"

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Open new window for frontend
start "Chef Chatter Frontend" cmd /k "cd %PROJECTDIR% && npm run dev"

echo.
echo Servers are starting...
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo To stop all servers, close the command windows or run:
echo   taskkill /IM node.exe /F
echo.
