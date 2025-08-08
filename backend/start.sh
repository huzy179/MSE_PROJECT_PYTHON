#!/bin/bash

# Start the FastAPI application
echo "Starting FastAPI backend server..."
cd /Users/maitranhuy/fullstack-demo/backend
source env/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
