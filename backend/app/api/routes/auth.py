from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.config import settings
from ...core.security import security
from ...db.database import get_db
from ...schemas.user import UserCreate, UserOut, LoginResponse, UserLogin
from ...crud.user import get_user_by_username, create_user, authenticate_user
from ...services.auth import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Create new user
    new_user = create_user(db=db, user=user)
    return new_user

@router.post("/login", response_model=LoginResponse)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token with user information"""
    # Authenticate user
    db_user = authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )

    # Return token with user information (no data wrapper for auth)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "role": db_user.role,
            "created_at": db_user.created_at,
            "is_deleted": db_user.deleted_at is not None
        }
    }

@router.get("/me", response_model=UserOut)
def read_users_me(
    credentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    current_user = get_current_user(db, credentials.credentials)
    return current_user
