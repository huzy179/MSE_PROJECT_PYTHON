import math
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...core.constants import UserRole
from ...core.security import security
from ...core.permissions import check_user_management_permission, check_own_resource_or_admin
from ...db.database import get_db
from ...schemas.user import BaseResponse, MessageResponse, PaginatedResponse, UserOut
from ...services.auth import get_current_user
from ...services.user_service import (
    get_user_by_id,
    get_users,
    get_users_count,
    restore_user,
    soft_delete_user,
)

router = APIRouter(prefix="/users", tags=["users"])


def get_current_user_dependency(
    credentials=Depends(security), db: Session = Depends(get_db)
):
    """Dependency to get current user from token"""
    return get_current_user(db, credentials.credentials)


@router.get("/", response_model=PaginatedResponse[UserOut])
def get_all_users(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    size: int = Query(10, ge=1, le=100, description="Number of records per page"),
    include_deleted: bool = Query(False, description="Include soft deleted users"),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user_dependency),
):
    """Get all users with pagination (admin only)"""
    # Check if current user is admin
    check_user_management_permission(current_user)

    # Calculate skip based on page and size
    skip = (page - 1) * size

    # Get total count and users
    total = get_users_count(db, include_deleted=include_deleted)
    users = get_users(db, skip=skip, limit=size, include_deleted=include_deleted)

    # Calculate total pages
    pages = math.ceil(total / size) if total > 0 else 1

    return {
        "data": users,
        "pagination": {"page": page, "size": size, "total": total, "pages": pages},
    }


@router.delete("/{user_id}", response_model=BaseResponse[MessageResponse])
def soft_delete_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user_dependency),
):
    """Soft delete a user (admin only)"""
    # Check if current user is admin
    check_user_management_permission(current_user)

    # Check if user exists
    user_to_delete = get_user_by_id(db, user_id)
    if not user_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Prevent admin from deleting themselves
    if user_to_delete.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself"
        )

    # Soft delete the user
    deleted_user = soft_delete_user(db, user_id)
    if not deleted_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete user"
        )

    return {
        "data": {"message": f"User {user_to_delete.username} has been soft deleted"}
    }


@router.get("/{user_id}", response_model=BaseResponse[UserOut])
def get_user_by_id_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user_dependency),
):
    """Get user by ID (admin only or own profile)"""
    # Allow users to view their own profile, admin can view any profile
    check_own_resource_or_admin(current_user, user_id)

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return {"data": user}


@router.patch("/{user_id}/restore", response_model=MessageResponse)
async def restore_user_endpoint(
    user_id: int,
    current_user=Depends(get_current_user_dependency),
    db: Session = Depends(get_db),
):
    """Restore soft deleted user (admin only)"""
    # Only admin can restore users
    check_user_management_permission(current_user)

    # Check if user exists (including deleted ones)
    user = get_user_by_id(db, user_id, include_deleted=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if user is actually deleted
    if user.deleted_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not deleted and cannot be restored",
        )

    # Restore the user
    restored_user = restore_user(db, user_id)
    if not restored_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore user",
        )

    return MessageResponse(
        message=f"User '{user.username}' has been restored successfully"
    )


@router.get("/deleted", response_model=PaginatedResponse[UserOut])
async def get_deleted_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user=Depends(get_current_user_dependency),
    db: Session = Depends(get_db),
):
    """Get deleted users (admin only)"""
    # Only admin can view deleted users
    check_user_management_permission(current_user)

    # Get deleted users only
    deleted_users = get_users(db, skip=skip, limit=limit, include_deleted=True)
    # Filter to only show deleted users
    deleted_users = [user for user in deleted_users if user.deleted_at is not None]

    total_deleted = get_users_count(db, include_deleted=True) - get_users_count(
        db, include_deleted=False
    )

    return PaginatedResponse(
        data=deleted_users,
        total=total_deleted,
        skip=skip,
        limit=limit,
    )
