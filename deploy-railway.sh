#!/bin/bash

# TaskFlow Deployment Script for Railway
# This script helps deploy the application to Railway

set -e

echo "🚀 Starting TaskFlow deployment to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "Checking Railway authentication..."
railway login --browserless || echo "Please run 'railway login' manually if needed"

# Link to existing project or create new one
if [ -z "$RAILWAY_PROJECT_ID" ]; then
    echo "Creating new Railway project..."
    railway init taskflow-backend --source=server
else
    echo "Linking to existing Railway project..."
    railway link $RAILWAY_PROJECT_ID
fi

# Set environment variables
echo "Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=$MONGODB_URI
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set CORS_ORIGIN=$CORS_ORIGIN
railway variables set FRONTEND_URL=$FRONTEND_URL

# Deploy
echo "Deploying to Railway..."
railway deploy

echo "✅ Backend deployment completed!"
echo "🌐 Your API will be available at: $(railway domain)"