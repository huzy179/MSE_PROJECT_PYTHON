from fastapi import APIRouter
from .routes.auth import router as auth_router

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth_router)

__all__ = ["api_router"]
