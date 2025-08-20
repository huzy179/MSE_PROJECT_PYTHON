from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_schedule_id = Column(Integer, ForeignKey("exam_schedules.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    answers = Column(Text, nullable=False)  # JSON string or text
    score = Column(Integer, nullable=True)
    is_late = Column(Boolean, default=False)

    student = relationship("User")
    exam_schedule = relationship("ExamSchedule")