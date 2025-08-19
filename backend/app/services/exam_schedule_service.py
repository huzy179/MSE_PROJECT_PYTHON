import math
from typing import Any, Dict, List, Optional

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from ..models.exam_schedule import ExamSchedule
from ..schemas.exam_schedule import ExamScheduleCreate, ExamScheduleUpdate

class ExamScheduleService:
    """Service for exam schedule operations"""

    @staticmethod
    def create_schedule(db: Session, schedule_in: ExamScheduleCreate) -> ExamSchedule:
        schedule = ExamSchedule(**schedule_in.dict())
        db.add(schedule)
        db.commit()
        db.refresh(schedule)
        return schedule

    @staticmethod
    def get_schedule_by_id(db: Session, schedule_id: int) -> Optional[ExamSchedule]:
        return (
            db.query(ExamSchedule)
            .filter(and_(ExamSchedule.id == schedule_id, ExamSchedule.deleted_at.is_(None)))
            .first()
        )

    @staticmethod
    def get_schedules_with_pagination(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Dict[str, Any]:
        query = db.query(ExamSchedule).filter(ExamSchedule.deleted_at.is_(None))

        if search:
            query = query.filter(
                ExamSchedule.title.ilike(f"%{search}%")
                | ExamSchedule.description.ilike(f"%{search}%")
            )
        if is_active is not None:
            query = query.filter(ExamSchedule.is_active == is_active)

        total = query.count()
        schedules = query.offset(skip).limit(limit).all()
        pages = math.ceil(total / limit) if limit > 0 else 1

        return {
            "data": schedules,
            "pagination": {
                "page": (skip // limit) + 1 if limit > 0 else 1,
                "size": limit,
                "total": total,
                "pages": pages,
            },
        }

    @staticmethod
    def update_schedule(
        db: Session, schedule_id: int, schedule_in: ExamScheduleUpdate
    ) -> Optional[ExamSchedule]:
        old_schedule = ExamScheduleService.get_schedule_by_id(db, schedule_id)
        if not old_schedule:
            return None

        # Đánh dấu bản ghi cũ là đã bị xóa (soft delete)
        old_schedule.deleted_at = func.now()
        db.commit()
        db.refresh(old_schedule)

        # Tạo bản ghi mới với dữ liệu cập nhật, giữ lại các trường không thay đổi
        new_data = old_schedule.__dict__.copy()
        update_data = schedule_in.model_dump(exclude_unset=True)
        new_data.update(update_data)
        new_data.pop("_sa_instance_state", None)
        new_data.pop("id", None)
        new_data.pop("deleted_at", None)

        new_schedule = ExamSchedule(**new_data)
        db.add(new_schedule)
        db.commit()
        db.refresh(new_schedule)
        return new_schedule

    @staticmethod
    def deactivate_schedule(db: Session, schedule_id: int) -> bool:
        schedule = ExamScheduleService.get_schedule_by_id(db, schedule_id)
        if not schedule:
            return False

        schedule.is_active = False
        db.commit()
        db.refresh(schedule)
        return True

    @staticmethod
    def delete_schedule(db: Session, schedule_id: int) -> bool:
        schedule = ExamScheduleService.get_schedule_by_id(db, schedule_id)
        if not schedule:
            return False

        schedule.deleted_at = func.now()
        db.commit()
        return True

# Backward compatibility functions
def create_schedule(db: Session, schedule_in: ExamScheduleCreate) -> ExamSchedule:
    return ExamScheduleService.create_schedule(db, schedule_in)

def get_schedule_by_id(db: Session, schedule_id: int) -> Optional[ExamSchedule]:
    return ExamScheduleService.get_schedule_by_id(db, schedule_id)

def get_schedules_with_pagination(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Dict[str, Any]:
    return ExamScheduleService.get_schedules_with_pagination(db, skip, limit, search, is_active)

def update_schedule(
    db: Session, schedule_id: int, schedule_in: ExamScheduleUpdate
) -> Optional[ExamSchedule]:
    return ExamScheduleService.update_schedule(db, schedule_id, schedule_in)

def deactivate_schedule(db: Session, schedule_id: int) -> bool:
    return ExamScheduleService.deactivate_schedule(db, schedule_id)

def delete_schedule(db: Session, schedule_id: int) -> bool:
    return ExamScheduleService.delete_schedule(db, schedule_id)