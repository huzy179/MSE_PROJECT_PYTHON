from sqlalchemy.orm import Session
from sqlalchemy import select, func
from passlib.context import CryptContext
from datetime import datetime
from ..models.user import User
from ..schemas.user import UserCreate
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str, include_deleted: bool = False) -> Optional[User]:
    """Get user by username (excluding soft deleted by default)"""
    stmt = select(User).where(User.username == username)
    if not include_deleted:
        stmt = stmt.where(User.deleted_at.is_(None))
    return db.execute(stmt).scalar_one_or_none()

def get_user_by_id(db: Session, user_id: int, include_deleted: bool = False) -> Optional[User]:
    """Get user by ID (excluding soft deleted by default)"""
    stmt = select(User).where(User.id == user_id)
    if not include_deleted:
        stmt = stmt.where(User.deleted_at.is_(None))
    return db.execute(stmt).scalar_one_or_none()

def get_users_count(db: Session, include_deleted: bool = False) -> int:
    """Get total count of users"""
    stmt = select(func.count(User.id))
    if not include_deleted:
        stmt = stmt.where(User.deleted_at.is_(None))
    return db.execute(stmt).scalar()

def get_users(db: Session, skip: int = 0, limit: int = 100, include_deleted: bool = False):
    """Get list of users (excluding soft deleted by default)"""
    stmt = select(User)
    if not include_deleted:
        stmt = stmt.where(User.deleted_at.is_(None))
    stmt = stmt.offset(skip).limit(limit)

def create_user(db: Session, user: UserCreate) -> User:
    """Create new user"""
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def soft_delete_user(db: Session, user_id: int) -> Optional[User]:
    """Soft delete user by setting deleted_at timestamp"""
    user = get_user_by_id(db, user_id, include_deleted=False)
    if not user:
        return None

    user.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def restore_user(db: Session, user_id: int) -> Optional[User]:
    """Restore soft deleted user by clearing deleted_at timestamp"""
    user = get_user_by_id(db, user_id, include_deleted=True)
    if not user or user.deleted_at is None:
        return None

    user.deleted_at = None
    db.commit()
    db.refresh(user)
    return user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate user with username and password"""
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
