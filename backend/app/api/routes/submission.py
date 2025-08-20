from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ...core.constants import UserRole
from ...core.security import security
from ...core.permissions import check_user_permission
from ...db.database import get_db
from ...services.auth import get_current_user
from ...schemas.submission import SubmissionCreate, SubmissionOut
from ...schemas.user import BaseResponse, PaginatedResponse
from ...services.submission_service import create_submission, get_submissions_by_student

submission_router = APIRouter(prefix="/submissions", tags=["Submissions"])


def get_current_user_dependency(
    credentials=Depends(security), db: Session = Depends(get_db)
):
    """Dependency to get current user from token"""
    return get_current_user(db, credentials.credentials)


def check_student_permission(current_user):
    """Check if user is student (only students can submit exams)"""
    check_user_permission(
        current_user,
        [UserRole.STUDENT],
        "Only students can submit exams"
    )


def check_submission_view_permission(current_user):
    """Check if user can view submissions (admin, teacher can view all; students can view their own)"""
    check_user_permission(
        current_user,
        [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
        "Access denied"
    )


@submission_router.post("/start", response_model=BaseResponse[SubmissionOut], status_code=status.HTTP_201_CREATED)
def start_exam_submission(
    exam_schedule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Start exam - create initial submission (students only)"""
    check_student_permission(current_user)

    # Check if student already has a submission for this exam schedule
    from ...models.submission import Submission
    existing_submission = db.query(Submission).filter(
        Submission.student_id == current_user.id,
        Submission.exam_schedule_id == exam_schedule_id
    ).first()

    if existing_submission:
        return {"data": existing_submission}

    # Create new submission with empty answers
    submission_data = SubmissionCreate(
        exam_schedule_id=exam_schedule_id,
        answers="[]"  # Empty answers initially
    )

    submission = create_submission(db, current_user.id, submission_data)
    return {"data": submission}


@submission_router.post("/", response_model=BaseResponse[SubmissionOut], status_code=status.HTTP_201_CREATED)
def submit_exam(
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Submit exam (students only)"""
    check_student_permission(current_user)
    print(f"🎯 Student {current_user.username} submitting exam:")
    print(f"   Exam Schedule ID: {submission_in.exam_schedule_id}")
    print(f"   Answers: {submission_in.answers}")

    submission = create_submission(db, current_user.id, submission_in)
    print(f"   Final Score: {submission.score}")
    return {"data": submission}

@submission_router.get("/", response_model=BaseResponse[List[SubmissionOut]])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Get my submissions (students can view their own, admin/teacher can view all)"""
    check_submission_view_permission(current_user)

    # Students can only see their own submissions
    if current_user.role == UserRole.STUDENT:
        submissions = get_submissions_by_student(db, current_user.id)
    else:
        # Admin and teachers can see all submissions (you may want to implement this service method)
        submissions = get_submissions_by_student(db, current_user.id)  # For now, same logic

    return {"data": submissions}


@submission_router.get("/{submission_id}/exam-data")
def get_submission_exam_data(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Get submission with exam schedule and exam data for taking exam"""
    from ...models.submission import Submission
    from ...models.exam_schedule import ExamSchedule
    from ...models.exam import Exam

    # Get submission
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Check if user owns this submission or is admin/teacher
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER] and submission.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get exam schedule
    exam_schedule = db.query(ExamSchedule).filter(ExamSchedule.id == submission.exam_schedule_id).first()
    if not exam_schedule:
        raise HTTPException(status_code=404, detail="Exam schedule not found")

    # Get exam with questions
    from ...services.exam_service import get_exam_by_id
    exam = get_exam_by_id(db, exam_schedule.exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    return {
        "submission": submission,
        "exam_schedule": exam_schedule,
        "exam": exam
    }