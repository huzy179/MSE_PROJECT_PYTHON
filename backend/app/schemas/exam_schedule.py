from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime   

# ExamSchedule schemas
class ExamScheduleBase(BaseModel):
    title: str
    description: Optional[str] = None
    exam_id: int
    start_time: datetime
    end_time: datetime
    max_attempts: int = 1

class ExamScheduleCreate(ExamScheduleBase):
    pass

class ExamScheduleOut(ExamScheduleBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExamScheduleUpdate(BaseModel):
    is_active: Optional[bool] = None
    title: Optional[str] = None
    description: Optional[str] = None
    max_attempts: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class ExamSchedulePaginationOut(BaseModel):
    data: List[ExamScheduleOut]
    pagination: Dict[str, Any]
