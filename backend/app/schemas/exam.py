from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class ExamQuestionBase(BaseModel):
    question_id: int
    question_order: int
    choice_order: str


class ExamQuestionCreate(ExamQuestionBase):
    pass


class ExamQuestionOut(ExamQuestionBase):
    id: int
    exam_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExamBase(BaseModel):
    code: str
    title: str
    subject: str
    duration: int  # in minutes
    total_questions: int
    description: Optional[str] = None
    is_active: bool = True

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, v):
        if v <= 0:
            raise ValueError("Duration must be greater than 0")
        return v

    @field_validator("total_questions")
    @classmethod
    def validate_total_questions(cls, v):
        if v <= 0:
            raise ValueError("Total questions must be greater than 0")
        return v


class ExamCreate(ExamBase):
    pass


class ExamUpdate(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    subject: Optional[str] = None
    duration: Optional[int] = None
    total_questions: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Duration must be greater than 0")
        return v

    @field_validator("total_questions")
    @classmethod
    def validate_total_questions(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Total questions must be greater than 0")
        return v


class ExamOut(ExamBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExamWithQuestions(ExamOut):
    exam_questions: List[ExamQuestionOut] = []

    class Config:
        from_attributes = True


class ExamGenerateRequest(BaseModel):
    """Request schema for generating a new exam"""
    code: str
    title: str
    subject: str
    duration: int  # in minutes
    total_questions: int
    description: Optional[str] = None
    shuffle_choices: bool = True  # Whether to shuffle answer choices

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, v):
        if v <= 0:
            raise ValueError("Duration must be greater than 0")
        return v

    @field_validator("total_questions")
    @classmethod
    def validate_total_questions(cls, v):
        if v <= 0:
            raise ValueError("Total questions must be greater than 0")
        return v


class ExamQuestionDetail(BaseModel):
    """Detailed question info for exam display"""
    id: int
    question_id: int
    question_order: int
    content: str
    content_img: Optional[str] = None
    choices: List[str]  # Shuffled choices
    choice_labels: List[str]  # Corresponding labels (A, B, C, D)
    correct_answer_index: int  # Index of correct answer in shuffled choices
    mark: float
    unit: Optional[str] = None

    class Config:
        from_attributes = True


class ExamDetailResponse(ExamOut):
    """Detailed exam response with questions"""
    questions: List[ExamQuestionDetail] = []
    creator_username: Optional[str] = None

    class Config:
        from_attributes = True
