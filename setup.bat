@echo off
REM TaskFlow Setup Script for Windows
REM This script sets up the entire project locally

echo.
echo 🚀 TaskFlow - Setup Script
echo ==================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v16+ first.
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd server

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please update .env with your MongoDB URI
)

call npm install
echo ✅ Backend setup complete
echo.

REM Setup Frontend
echo 📦 Setting up Frontend...
cd ..\client

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
)

call npm install
echo ✅ Frontend setup complete
echo.

echo ==================================
echo ✅ Setup Complete!
echo.
echo To start the app, run:
echo.
echo Command Prompt 1 (Backend):
echo   cd server
echo   npm run dev
echo.
echo Command Prompt 2 (Frontend):
echo   cd client
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo Demo credentials:
echo   Email: demo@example.com
echo   Password: password123
echo.
