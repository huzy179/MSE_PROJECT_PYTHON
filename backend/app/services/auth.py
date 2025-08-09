from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ..core.config import settings
from ..crud.user import get_user_by_username
from ..schemas.user import TokenData

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception) -> TokenData:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            raise credentials_exception

        # Check if sub is user_id (number) or username (string)
        try:
            user_id = int(sub)
            # If it's a number, it's user_id - we need to get username
            token_data = TokenData(username=sub)  # Store the sub value for now
        except ValueError:
            # If it's not a number, it's username
            token_data = TokenData(username=sub)

        return token_data
    except JWTError:
        raise credentials_exception

def get_current_user(db: Session, token: str):
    """Get current user from JWT token"""
    from fastapi import HTTPException, status
    from ..crud.user import get_user_by_id

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = verify_token(token, credentials_exception)

    # Check if token_data.username is actually a user_id
    try:
        user_id = int(token_data.username)
        user = get_user_by_id(db, user_id=user_id)
    except ValueError:
        # If it's not a number, treat as username
        user = get_user_by_username(db, username=token_data.username)

    if user is None:
        raise credentials_exception
    return user
