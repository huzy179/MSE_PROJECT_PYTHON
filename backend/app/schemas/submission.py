from pydantic import BaseModel
from typing import Optional

class SubmissionCreate(BaseModel):
    exam_schedule_id: int
    answers: str  # or Dict if you want structured answers

class SubmissionOut(BaseModel):
    id: int
    student_id: int
    exam_schedule_id: int
    submitted_at: str
    answers: str
    score: Optional[int]
    is_late: bool

    class Config:
        orm_mode = True