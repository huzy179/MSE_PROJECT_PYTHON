from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...services.auth import get_current_user
from ...schemas.submission import SubmissionCreate, SubmissionOut
from ...services.submission_service import create_submission, get_submissions_by_student

submission_router = APIRouter(prefix="/submissions", tags=["Submissions"])

@submission_router.post("/", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
def submit_exam(
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Chỉ cho student submit
    # if current_user.role != UserRole.STUDENT: raise HTTPException(...)
    return create_submission(db, current_user.id, submission_in)

@submission_router.get("/", response_model=list[SubmissionOut])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_submissions_by_student(db, current_user.id)