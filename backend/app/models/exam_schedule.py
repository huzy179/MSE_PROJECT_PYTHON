from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from ..db.database import Base

class ExamSchedule(Base):
    __tablename__ = "exam_schedules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)  # Tên phiên thi
    description = Column(Text, nullable=True)  # Mô tả phiên thi
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)  # Thời gian bắt đầu
    end_time = Column(DateTime(timezone=True), nullable=False)    # Thời gian kết thúc
    max_attempts = Column(Integer, default=1)  # Số lần thi tối đa
    is_active = Column(Boolean, default=True)  # Trạng thái hoạt động
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    exam = relationship("Exam", back_populates="schedules")

    def __repr__(self):
        return (
            f"<ExamSchedule(id={self.id}, title='{self.title}', exam_id={self.exam_id}, start_time='{self.start_time}', end_time='{self.end_time}', is_active={self.is_active})>"
        )




