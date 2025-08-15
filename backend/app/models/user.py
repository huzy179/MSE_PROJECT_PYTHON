from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..db.database import Base
from ..core.constants import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.STUDENT, index=True)

    # Timestamp columns
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # For soft delete

    def __repr__(self):
        return (f"<User(id={self.id}, "
                f"username='{self.username}', "
                f"role='{self.role}')>")
