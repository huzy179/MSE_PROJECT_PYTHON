"""
Permission utilities for role-based access control
"""
from typing import List
from fastapi import HTTPException, status
from ..core.constants import UserRole


def check_user_permission(current_user, allowed_roles: List[str], error_message: str = None):
    """
    Check if current user has permission based on allowed roles
    
    Args:
        current_user: Current authenticated user object
        allowed_roles: List of roles that are allowed to access the resource
        error_message: Custom error message (optional)
    
    Raises:
        HTTPException: If user doesn't have required permission
    """
    if current_user.role not in allowed_roles:
        if error_message is None:
            role_names = ", ".join(allowed_roles)
            error_message = f"Access denied. Required roles: {role_names}"
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_message,
        )


# Predefined permission functions for common use cases
def check_admin_only(current_user):
    """Check if user is admin only"""
    check_user_permission(
        current_user, 
        [UserRole.ADMIN], 
        "Only administrators can access this resource"
    )


def check_teacher_or_admin(current_user):
    """Check if user is teacher or admin"""
    check_user_permission(
        current_user, 
        [UserRole.TEACHER, UserRole.ADMIN], 
        "Only teachers and admins can access this resource"
    )


def check_question_edit_permission(current_user):
    """Check if user can edit questions (admin, teacher, editor)"""
    check_user_permission(
        current_user, 
        [UserRole.ADMIN, UserRole.TEACHER, UserRole.EDITOR], 
        "Only admins, teachers, and editors can edit questions"
    )


def check_question_import_permission(current_user):
    """Check if user can import questions (admin, teacher, importer)"""
    check_user_permission(
        current_user, 
        [UserRole.ADMIN, UserRole.TEACHER, UserRole.IMPORTER], 
        "Only admins, teachers, and importers can import questions"
    )


def check_question_view_permission(current_user):
    """Check if user can view questions (all roles except student for management)"""
    check_user_permission(
        current_user, 
        [UserRole.ADMIN, UserRole.TEACHER, UserRole.EDITOR, UserRole.IMPORTER], 
        "Only admins, teachers, editors, and importers can view question management"
    )


def check_exam_management_permission(current_user):
    """Check if user can manage exams (admin, teacher only)"""
    check_user_permission(
        current_user, 
        [UserRole.ADMIN, UserRole.TEACHER], 
        "Only admins and teachers can manage exams"
    )


def check_user_management_permission(current_user):
    """Check if user can manage users (admin only)"""
    check_user_permission(
        current_user, 
        [UserRole.ADMIN], 
        "Only administrators can manage users"
    )


def check_own_resource_or_admin(current_user, resource_owner_id: int):
    """Check if user can access their own resource or is admin"""
    if current_user.role != UserRole.ADMIN and current_user.id != resource_owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own resources",
        )
