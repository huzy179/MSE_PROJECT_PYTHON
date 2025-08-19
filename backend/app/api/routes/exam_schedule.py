from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...schemas.exam_schedule import ExamScheduleCreate, ExamScheduleOut, ExamScheduleUpdate, ExamSchedulePaginationOut
from ...services.exam_schedule_service import (
    create_schedule,
    get_schedule_by_id,
    get_schedules_with_pagination,
    update_schedule,
    deactivate_schedule,
    delete_schedule,
)

exam_schedule_router = APIRouter(prefix="/exam_schedules", tags=["Exam Schedules"])

@exam_schedule_router.post("/", response_model=ExamScheduleOut, status_code=status.HTTP_201_CREATED)
def create_exam_schedule(schedule_in: ExamScheduleCreate, db: Session = Depends(get_db)):
    return create_schedule(db, schedule_in)

@exam_schedule_router.get("/", response_model=list[ExamScheduleOut])
def list_exam_schedules(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
):
    result = get_schedules_with_pagination(db, skip=skip, limit=limit, search=search, is_active=is_active)
    return result["data"]

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

@exam_schedule_router.get("/{schedule_id}", response_model=ExamScheduleOut)
def get_exam_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = get_schedule_by_id(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Exam schedule not found")
    return schedule

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