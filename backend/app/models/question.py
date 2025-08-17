from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    create_engine,
    func,
)
from sqlalchemy.orm import declarative_base, sessionmaker

from ..db.database import Base


# Define Question table: Question
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    code = Column(String)
    content = Column(String)
    content_img = Column(String)
    choiceA = Column(String)
    choiceB = Column(String)
    choiceC = Column(String)
    choiceD = Column(String)
    answer = Column(String)
    mark = Column(Float)
    unit = Column(String)
    mix = Column(Boolean)
    subject = Column(String)
    lecturer = Column(String)

    importer = Column(Integer)
    editor = Column(Integer)

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
            f"<Question(id={self.id},"
            f"code='{self.code}',"
            f"content='{self.content}',"
            f"content_img='{self.content_img}',"
            f"choiceA='{self.choiceA}',"
            f"choiceB='{self.choiceB}',"
            f"choiceC='{self.choiceC}',"
            f"choiceD='{self.choiceD}',"
            f"answer='{self.answer}',"
            f"mark='{self.mark}',"
            f"unit='{self.unit}',"
            f"mix='{self.mix}',"
            f"subject='{self.subject}',"
            f"importer='{self.importer}',"
            f"editor='{self.editor}',"
            f"lecturer = '{self.lecturer}'>"
        )
