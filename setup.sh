#!/bin/bash

# TaskFlow Setup Script
# This script sets up the entire project locally

echo "🚀 TaskFlow - Setup Script"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd server || exit

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your MongoDB URI"
fi

npm install
echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../client || exit

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

npm install
echo "✅ Frontend setup complete"
echo ""

echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "To start the app, run:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Demo credentials:"
echo "  Email: demo@example.com"
echo "  Password: password123"
echo ""
