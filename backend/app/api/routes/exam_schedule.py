from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...core.constants import UserRole
from ...core.security import security
from ...core.permissions import check_exam_management_permission
from ...db.database import get_db
from ...services.auth import get_current_user
from ...schemas.exam_schedule import ExamScheduleCreate, ExamScheduleOut, ExamScheduleUpdate, ExamSchedulePaginationOut
from ...schemas.user import PaginatedResponse
from ...services.exam_schedule_service import (
    create_schedule,
    get_schedule_by_id,
    get_schedules_with_pagination,
    update_schedule,
    deactivate_schedule,
    delete_schedule,
)

exam_schedule_router = APIRouter(prefix="/exam_schedules", tags=["Exam Schedules"])

def get_current_user_dependency(
    credentials=Depends(security), db: Session = Depends(get_db)
):
    """Dependency to get current user from token"""
    return get_current_user(db, credentials.credentials)



@exam_schedule_router.post("/", response_model=ExamScheduleOut, status_code=status.HTTP_201_CREATED)
def create_exam_schedule(
    schedule_in: ExamScheduleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency)
):
    """Create exam schedule (teacher/admin only)"""
    check_exam_management_permission(current_user)
    return create_schedule(db, schedule_in)


@exam_schedule_router.get("/", response_model=PaginatedResponse[ExamScheduleOut])
def get_exam_schedules(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    size: int = Query(10, ge=1, le=100, description="Number of records per page"),
    search: Optional[str] = Query(None, description="Search in title or description"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    exam_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency), 
):
    """Get exam schedules with pagination (teacher/admin only)"""
    check_exam_management_permission(current_user)
    skip = (page - 1) * size
    result = get_schedules_with_pagination(db, skip=skip, limit=size, search=search, is_active=is_active, exam_id=exam_id)
    return result

@exam_schedule_router.get("/pagination", response_model=ExamSchedulePaginationOut)
def list_exam_schedules_with_pagination(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
):
    result = get_schedules_with_pagination(db, skip=skip, limit=limit, search=search, is_active=is_active)
    result["data"] = [ExamScheduleOut.model_validate(s) for s in result["data"]]
    return result

@exam_schedule_router.get("/student/available", response_model=ExamSchedulePaginationOut)
def get_available_exam_schedules_for_students(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=1000),
):
    """Get available exam schedules for students (authenticated users only)"""
    # Students can see active exam schedules
    result = get_schedules_with_pagination(db, skip=skip, limit=limit, is_active=True)
    result["data"] = [ExamScheduleOut.model_validate(s) for s in result["data"]]
    return result

@exam_schedule_router.get("/{schedule_id}", response_model=ExamScheduleOut)
def get_exam_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency)
):
    """Get exam schedule by ID (authenticated users only)"""
    schedule = get_schedule_by_id(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Exam schedule not found")
    return schedule


@exam_schedule_router.get("/{schedule_id}/with-exam")
def get_exam_schedule_with_exam(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency)
):
    """Get exam schedule with exam details for students"""
    from ...models.exam_schedule import ExamSchedule
    from ...models.exam import Exam, ExamQuestion
    from ...models.question import Question

    # Get exam schedule with exam
    schedule = db.query(ExamSchedule).filter(ExamSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Exam schedule not found")

    # Get exam with questions
    exam = db.query(Exam).filter(Exam.id == schedule.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Get questions for this exam
    exam_questions = db.query(ExamQuestion).filter(
        ExamQuestion.exam_id == exam.id
    ).order_by(ExamQuestion.question_order).all()

    questions = []
    for eq in exam_questions:
        question = db.query(Question).filter(Question.id == eq.question_id).first()
        if question:
            questions.append({
                "id": question.id,
                "content": question.content,
                "content_img": question.content_img,
                "choiceA": question.choiceA,
                "choiceB": question.choiceB,
                "choiceC": question.choiceC,
                "choiceD": question.choiceD,
                "answer": question.answer,
                "mark": question.mark,
                "unit": question.unit,
                "subject": question.subject,
                "question_order": eq.question_order
            })

    return {
        "schedule": {
            "id": schedule.id,
            "title": schedule.title,
            "description": schedule.description,
            "exam_id": schedule.exam_id,
            "start_time": schedule.start_time,
            "end_time": schedule.end_time,
            "is_active": schedule.is_active
        },
        "exam": {
            "id": exam.id,
            "title": exam.title,
            "description": exam.description,
            "questions": questions,
            "duration": exam.duration
        }
    }

@exam_schedule_router.put("/{schedule_id}", response_model=ExamScheduleOut)
def update_exam_schedule(
    schedule_id: int,
    schedule_in: ExamScheduleUpdate,
    db: Session = Depends(get_db),
):
    schedule = update_schedule(db, schedule_id, schedule_in)
    if not schedule:
        raise HTTPException(status_code=404, detail="Exam schedule not found")
    return schedule

@exam_schedule_router.put("/{schedule_id}/deactivate", response_model=dict)
def deactivate_exam_schedule(schedule_id: int, db: Session = Depends(get_db)):
    success = deactivate_schedule(db, schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exam schedule not found")
    return {"success": True}

@exam_schedule_router.delete("/{schedule_id}", response_model=dict)
def delete_exam_schedule(schedule_id: int, db: Session = Depends(get_db)):
    success = delete_schedule(db, schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exam schedule not found")
    return {"success": True}