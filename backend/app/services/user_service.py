from datetime import datetime
from typing import Optional

from passlib.context import CryptContext
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.user import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """Service for user operations"""

    @staticmethod
    def get_user_by_username(
        db: Session, username: str, include_deleted: bool = False
    ) -> Optional[User]:
        """Get user by username (excluding soft deleted by default)"""
        stmt = select(User).where(User.username == username)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_user_by_id(
        db: Session, user_id: int, include_deleted: bool = False
    ) -> Optional[User]:
        """Get user by ID (excluding soft deleted by default)"""
        stmt = select(User).where(User.id == user_id)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_users(
        db: Session, skip: int = 0, limit: int = 100, include_deleted: bool = False
    ):
        """Get users with pagination (excluding soft deleted by default)"""
        stmt = select(User)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        stmt = stmt.offset(skip).limit(limit)
        return db.execute(stmt).scalars().all()

    @staticmethod
    def get_users_count(db: Session, include_deleted: bool = False) -> int:
        """Get total count of users (excluding soft deleted by default)"""
        stmt = select(func.count(User.id))
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        return db.execute(stmt).scalar()

    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        """Create a new user"""
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            username=user.username,
            hashed_password=hashed_password,
            role=user.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def soft_delete_user(db: Session, user_id: int) -> Optional[User]:
        """Soft delete user by setting deleted_at timestamp"""
        user = UserService.get_user_by_id(db, user_id, include_deleted=False)
        if not user:
            return None

        user.deleted_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def restore_user(db: Session, user_id: int) -> Optional[User]:
        """Restore soft deleted user by clearing deleted_at timestamp"""
        user = UserService.get_user_by_id(db, user_id, include_deleted=True)
        if not user or user.deleted_at is None:
            return None

        user.deleted_at = None
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password"""
        user = UserService.get_user_by_username(db, username)
        if not user:
            return None
        if not UserService.verify_password(password, user.hashed_password):
            return None
        return user


# Backward compatibility functions
def get_user_by_username(db: Session, username: str, include_deleted: bool = False) -> Optional[User]:
    return UserService.get_user_by_username(db, username, include_deleted)

def get_user_by_id(db: Session, user_id: int, include_deleted: bool = False) -> Optional[User]:
    return UserService.get_user_by_id(db, user_id, include_deleted)

def get_users(db: Session, skip: int = 0, limit: int = 100, include_deleted: bool = False):
    return UserService.get_users(db, skip, limit, include_deleted)

def get_users_count(db: Session, include_deleted: bool = False) -> int:
    return UserService.get_users_count(db, include_deleted)

def create_user(db: Session, user: UserCreate) -> User:
    return UserService.create_user(db, user)

def soft_delete_user(db: Session, user_id: int) -> Optional[User]:
    return UserService.soft_delete_user(db, user_id)

def restore_user(db: Session, user_id: int) -> Optional[User]:
    return UserService.restore_user(db, user_id)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return UserService.verify_password(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return UserService.get_password_hash(password)

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    return UserService.authenticate_user(db, username, password)
