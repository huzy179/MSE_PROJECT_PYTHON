# Backend API

A well-structured FastAPI backend application with authentication.

## Project Structure

```
fullstack-demo/
├── env/                    # Python virtual environment (shared)
├── backend/                # Backend application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # Main FastAPI application
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       └── auth.py # Authentication routes
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py   # Application settings
│   │   ├── crud/
│   │   │   ├── __init__.py
│   │   │   └── user.py     # User CRUD operations
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── database.py # Database connection
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── user.py     # Database models
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── user.py     # Pydantic schemas
│   │   └── services/
│   │       ├── __init__.py
│   │       └── auth.py     # Authentication services
│   ├── main.py             # Application entry point
│   ├── init_db.py          # Database initialization
│   ├── requirements.txt    # Python dependencies
│   ├── start.sh           # Start script
│   └── .env.example       # Environment variables example
└── frontend/              # Frontend application (separate)
```

## Features

- JWT Authentication
- User registration and login
- PostgreSQL database integration
- CORS middleware
- Well-structured modular architecture
- Input validation with Pydantic
- Password hashing with bcrypt

## Setup

**Note**: The virtual environment `env/` is located at the project root level and shared between backend components.

1. **Navigate to project root and activate virtual environment:**
```bash
cd /Users/maitranhuy/fullstack-demo
source env/bin/activate
```

2. **Navigate to backend and install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the server:
```bash
chmod +x start.sh
./start.sh
```

Or manually:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user info
- `GET /health` - Health check

## Development

The application runs on `http://localhost:8000` by default.
API documentation is available at `http://localhost:8000/docs`.
