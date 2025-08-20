from fastapi import APIRouter

from .routes.auth import router as auth_router
from .routes.exams import router as exams_router
from .routes.questions import router as questions_router
from .routes.users import router as users_router
from .routes.exam_schedule import exam_schedule_router
from .routes.submission import submission_router

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(questions_router)
api_router.include_router(exams_router)
api_router.include_router(exam_schedule_router)
api_router.include_router(submission_router)

__all__ = ["api_router"]
