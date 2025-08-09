from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router
from app.db.database import engine
from app.models.user import User

# Create database tables
User.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Backend API",
    description="A well-structured FastAPI backend",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the Backend API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
