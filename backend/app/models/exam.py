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


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)  # Mã đề thi
    title = Column(String, nullable=False)  # Tiêu đề đề thi
    subject = Column(String, nullable=False)  # Môn học
    duration = Column(Integer, nullable=False)  # Thời gian thi (phút)
    total_questions = Column(Integer, nullable=False)  # Số câu hỏi trong đề
    description = Column(Text, nullable=True)  # Mô tả đề thi
    is_active = Column(Boolean, default=True)  # Trạng thái hoạt động
    
    # Foreign key to user (teacher who created the exam)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship to user
    creator = relationship("User", back_populates="exams")
    
    # Relationship to exam questions
    exam_questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")

    # Timestamp columns
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # For soft delete

    def __repr__(self):
        return (
            f"<Exam(id={self.id}, "
            f"code='{self.code}', "
            f"title='{self.title}', "
            f"subject='{self.subject}', "
            f"duration={self.duration}, "
            f"total_questions={self.total_questions}, "
            f"created_by={self.created_by})>"
        )


class ExamQuestion(Base):
    """Junction table for exam and questions with shuffled choices"""
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    question_order = Column(Integer, nullable=False)  # Thứ tự câu hỏi trong đề
    
    # Shuffled choices - store the shuffled order of choices
    choice_order = Column(String, nullable=False)  # e.g., "B,A,D,C" for shuffled order
    
    # Relationships
    exam = relationship("Exam", back_populates="exam_questions")
    question = relationship("Question")

    # Timestamp columns
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self):
        return (
            f"<ExamQuestion(id={self.id}, "
            f"exam_id={self.exam_id}, "
            f"question_id={self.question_id}, "
            f"question_order={self.question_order}, "
            f"choice_order='{self.choice_order}')>"
        )
