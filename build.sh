#!/bin/bash
# Build script for Monolith Deployment (Render/Heroku)

echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt

echo "Build Complete."
