from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class QuestionBase(BaseModel):
    code: Optional[str] = None
    content: str
    content_img: Optional[str] = None
    choiceA: str
    choiceB: str
    choiceC: str
    choiceD: str
    answer: str
    mark: float = 1.0
    unit: Optional[str] = None
    mix: bool = False
    subject: Optional[str] = None
    lecturer: Optional[str] = None

    @field_validator("answer")
    @classmethod
    def validate_answer(cls, v):
        if v not in ["A", "B", "C", "D"]:
            raise ValueError("Answer must be one of: A, B, C, D")
        return v

    @field_validator("mark")
    @classmethod
    def validate_mark(cls, v):
        if v <= 0:
            raise ValueError("Mark must be greater than 0")
        return v


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    code: Optional[str] = None
    content: Optional[str] = None
    content_img: Optional[str] = None
    choiceA: Optional[str] = None
    choiceB: Optional[str] = None
    choiceC: Optional[str] = None
    choiceD: Optional[str] = None
    answer: Optional[str] = None
    mark: Optional[float] = None
    unit: Optional[str] = None
    mix: Optional[bool] = None
    subject: Optional[str] = None
    lecturer: Optional[str] = None

    @field_validator("answer")
    @classmethod
    def validate_answer(cls, v):
        if v is not None and v not in ["A", "B", "C", "D"]:
            raise ValueError("Answer must be one of: A, B, C, D")
        return v

    @field_validator("mark")
    @classmethod
    def validate_mark(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Mark must be greater than 0")
        return v


class QuestionOut(QuestionBase):
    id: int
    importer: Optional[int] = None
    editor: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuestionInDB(QuestionOut):
    pass
