import math
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...core.constants import UserRole
from ...core.security import security
from ...db.database import get_db
from ...schemas.exam import (
    ExamCreate,
    ExamDetailResponse,
    ExamGenerateRequest,
    ExamOut,
    ExamQuestionDetail,
    ExamUpdate,
    ExamWithQuestions,
)
from ...schemas.user import BaseResponse, MessageResponse, PaginatedResponse, PaginationInfo
from ...services.auth import get_current_user
from ...services.exam_service import (
    create_exam,
    generate_exam_from_questions,
    get_exam_by_code,
    get_exam_by_id,
    get_exam_with_questions,
    get_exams,
    get_exams_count,
    get_subjects,
    restore_exam,
    soft_delete_exam,
    update_exam,
)

router = APIRouter(prefix="/exams", tags=["exams"])


def get_current_user_dependency(
    credentials=Depends(security), db: Session = Depends(get_db)
):
    """Dependency to get current user from token"""
    return get_current_user(db, credentials.credentials)


def check_teacher_or_admin_permission(current_user):
    """Check if user is teacher or admin"""
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can access this resource",
        )


@router.post("/", response_model=ExamOut, status_code=status.HTTP_201_CREATED)
def create_new_exam(
    exam: ExamCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Create a new exam (teacher/admin only)"""
    check_teacher_or_admin_permission(current_user)

    # Check if exam code already exists
    existing_exam = get_exam_by_code(db, exam.code)
    if existing_exam:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam code already exists",
        )

    return create_exam(db=db, exam=exam, created_by=current_user.id)


@router.post("/generate", response_model=ExamOut, status_code=status.HTTP_201_CREATED)
def generate_exam(
    exam_request: ExamGenerateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Generate a new exam from available questions (teacher/admin only)"""
    check_teacher_or_admin_permission(current_user)

    # Check if exam code already exists
    existing_exam = get_exam_by_code(db, exam_request.code)
    if existing_exam:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam code already exists",
        )

    # Generate exam
    new_exam = generate_exam_from_questions(
        db=db, exam_request=exam_request, created_by=current_user.id
    )

    if not new_exam:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough questions available for the specified subject",
        )

    return new_exam


@router.get("/", response_model=PaginatedResponse[ExamOut])
def get_exams_list(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    created_by: Optional[int] = Query(None, description="Filter by creator"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Get list of exams with pagination (teacher/admin only)"""
    check_teacher_or_admin_permission(current_user)

    # If not admin, only show exams created by current user
    if current_user.role != UserRole.ADMIN:
        created_by = current_user.id

    skip = (page - 1) * page_size
    exams = get_exams(
        db=db,
        skip=skip,
        limit=page_size,
        subject=subject,
        created_by=created_by,
    )

    total_count = get_exams_count(
        db=db,
        subject=subject,
        created_by=created_by,
    )

    total_pages = math.ceil(total_count / page_size)

    return PaginatedResponse(
        data=exams,
        pagination=PaginationInfo(
            page=page,
            size=page_size,
            total=total_count,
            pages=total_pages,
        )
    )


@router.get("/subjects", response_model=List[str])
def get_available_subjects(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Get list of available subjects (teacher/admin only)"""
    check_teacher_or_admin_permission(current_user)
    return get_subjects(db)


@router.get("/{exam_id}", response_model=ExamDetailResponse)
def get_exam_detail(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Get exam details with questions (teacher/admin only)"""
    check_teacher_or_admin_permission(current_user)

    exam = get_exam_with_questions(db, exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )

    # If not admin, only allow access to own exams
    if current_user.role != UserRole.ADMIN and exam.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own exams",
        )

    # Build detailed response with questions
    questions = []
    for exam_question in exam.exam_questions:
        question = exam_question.question
        
        # Parse choice order
        choice_order = exam_question.choice_order.split(",")
        
        # Map choices to their shuffled order
        original_choices = {
            "A": question.choiceA,
            "B": question.choiceB,
            "C": question.choiceC,
            "D": question.choiceD,
        }
        
        shuffled_choices = [original_choices[choice] for choice in choice_order]
        
        # Find correct answer index in shuffled choices
        correct_answer_index = choice_order.index(question.answer)
        
        question_detail = ExamQuestionDetail(
            id=exam_question.id,
            question_id=question.id,
            question_order=exam_question.question_order,
            content=question.content,
            content_img=question.content_img,
            choices=shuffled_choices,
            choice_labels=choice_order,
            correct_answer_index=correct_answer_index,
            mark=question.mark,
            unit=question.unit,
        )
        questions.append(question_detail)

    # Sort questions by order
    questions.sort(key=lambda x: x.question_order)

    return ExamDetailResponse(
        id=exam.id,
        code=exam.code,
        title=exam.title,
        subject=exam.subject,
        duration=exam.duration,
        total_questions=exam.total_questions,
        description=exam.description,
        is_active=exam.is_active,
        created_by=exam.created_by,
        created_at=exam.created_at,
        updated_at=exam.updated_at,
        deleted_at=exam.deleted_at,
        questions=questions,
        creator_username=exam.creator.username if exam.creator else None,
    )


@router.put("/{exam_id}", response_model=ExamOut)
def update_exam_endpoint(
    exam_id: int,
    exam_update: ExamUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Update exam (teacher/admin only)"""
    check_teacher_or_admin_permission(current_user)

    exam = get_exam_by_id(db, exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )

    # If not admin, only allow updating own exams
    if current_user.role != UserRole.ADMIN and exam.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own exams",
        )

    # Check if new code already exists (if code is being updated)
    if exam_update.code and exam_update.code != exam.code:
        existing_exam = get_exam_by_code(db, exam_update.code)
        if existing_exam:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exam code already exists",
            )

    updated_exam = update_exam(db, exam_id, exam_update)
    if not updated_exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )

    return updated_exam


@router.delete("/{exam_id}", response_model=MessageResponse)
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Soft delete exam (teacher/admin only)"""
    check_teacher_or_admin_permission(current_user)

    exam = get_exam_by_id(db, exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )

    # If not admin, only allow deleting own exams
    if current_user.role != UserRole.ADMIN and exam.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own exams",
        )

    success = soft_delete_exam(db, exam_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )

    return MessageResponse(message="Exam deleted successfully")


@router.post("/{exam_id}/restore", response_model=MessageResponse)
def restore_exam_endpoint(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Restore soft deleted exam (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can restore exams",
        )

    success = restore_exam(db, exam_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found or not deleted",
        )

    return MessageResponse(message="Exam restored successfully")
