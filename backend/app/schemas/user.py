from pydantic import BaseModel, field_validator
from typing import Optional, Generic, TypeVar, List
from datetime import datetime
from ..core.constants import UserRole

T = TypeVar('T')

class PaginationInfo(BaseModel):
    page: int
    size: int
    total: int
    pages: int

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationInfo

class BaseResponse(BaseModel, Generic[T]):
    data: T

class MessageResponse(BaseModel):
    message: str

class UserBase(BaseModel):
    username: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = UserRole.STUDENT

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if not UserRole.is_valid_role(v):
            raise ValueError(f'Invalid role. Must be one of: {UserRole.all_roles()}')
        return v

class UserUpdate(UserBase):
    password: Optional[str] = None
    role: Optional[str] = None

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v is not None and not UserRole.is_valid_role(v):
            raise ValueError(f'Invalid role. Must be one of: {UserRole.all_roles()}')
        return v

class UserInDB(UserBase):
    id: int
    hashed_password: str
    role: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserLoginOut(UserBase):
    id: int
    role: str
    created_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserLoginOut

class TokenData(BaseModel):
    username: Optional[str] = None
