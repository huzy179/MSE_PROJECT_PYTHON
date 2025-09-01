from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubmissionCreate(BaseModel):
    exam_schedule_id: int
    answers: str  # or Dict if you want structured answers

class SubmissionOut(BaseModel):
    id: int
    student_id: int
    exam_schedule_id: int
    submitted_at: Optional[datetime]
    answers: str
    score: Optional[int]
    is_late: bool

    class Config:
        from_attributes = True