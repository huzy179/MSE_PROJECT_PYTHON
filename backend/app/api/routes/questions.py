import json
import tempfile
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from ...core.constants import UserRole
from ...core.security import security
from ...core.permissions import (
    check_question_edit_permission,
    check_question_import_permission,
    check_question_view_permission,
)
from ...db.database import get_db
from ...schemas.question import QuestionCreate, QuestionOut, QuestionUpdate
from ...schemas.user import BaseResponse, MessageResponse, PaginatedResponse
from ...services.auth import get_current_user
from ...services.question_service import (
    create_question,
    delete_question,
    get_question,
    get_question_by_id,
    get_questions_with_pagination,
    get_subjects,
    import_data,
    reading_file,
    update_question,
)

router = APIRouter(prefix="/questions", tags=["questions"])


def get_current_user_dependency(
    credentials=Depends(security), db: Session = Depends(get_db)
):
    """Dependency to get current user from token"""
    return get_current_user(db, credentials.credentials)





@router.post("/import_file")
async def read_docx(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency)
):
    """Import questions from file (Admin/Teacher/Importer only)"""
    check_question_import_permission(current_user)

    # Create temporary file to upload
    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    # Read content file .docx using python-docx
    listQuest = reading_file(tmp_path)

    for item in listQuest:
        item["importer"] = current_user.id

    result = import_data(listQuest)

    for item in listQuest:
        item["importer"] = current_user.username

    if len(listQuest) == 0:
        return {
            "code": 201,
            "message": "Không có dữ liệu hợp lệ để import. Vui lòng kiểm tra lại file và cấu trúc file .docx bạn vừa nhập.",
        }
    elif result["code"] != 200:
        return result
    return {"code": 200, "message": "Successful!", "data": listQuest}


# CRUD Endpoints


@router.get("/", response_model=PaginatedResponse[QuestionOut])
def get_questions(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    size: int = Query(10, ge=1, le=100, description="Number of records per page"),
    search: Optional[str] = Query(
        None, description="Search in content, code, or subject"
    ),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Get questions with pagination (Admin/Teacher/Editor/Importer only)"""
    check_question_view_permission(current_user)

    skip = (page - 1) * size
    result = get_questions_with_pagination(
        db, skip=skip, limit=size, search=search, subject=subject
    )
    return result


@router.post("/", response_model=BaseResponse[QuestionOut])
def create_new_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Create a new question (Admin/Teacher/Editor only)"""
    check_question_edit_permission(current_user)

    db_question = create_question(db, question, current_user.id)
    return {"data": db_question}


@router.get("/{question_id}", response_model=BaseResponse[QuestionOut])
def get_question_detail(
    question_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Get question by ID (Admin/Teacher/Editor/Importer only)"""
    check_question_view_permission(current_user)

    question = get_question_by_id(db, question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    return {"data": question}


@router.put("/{question_id}", response_model=BaseResponse[QuestionOut])
def update_question_endpoint(
    question_id: int,
    question: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Update a question (Admin/Teacher/Editor only)"""
    check_question_edit_permission(current_user)

    db_question = update_question(db, question_id, question, current_user.id)
    if not db_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    return {"data": db_question}


@router.delete("/{question_id}", response_model=BaseResponse[MessageResponse])
def delete_question_endpoint(
    question_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Delete a question (Admin/Teacher/Editor only)"""
    check_question_edit_permission(current_user)

    success = delete_question(db, question_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    return {"data": {"message": "Question deleted successfully"}}


@router.get("/subjects/list", response_model=BaseResponse[List[str]])
def get_subjects_list(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_dependency),
):
    """Get all subjects (Admin/Teacher/Editor/Importer only)"""
    check_question_view_permission(current_user)

    subjects = get_subjects(db)
    return {"data": subjects}


# Legacy endpoints for backward compatibility
@router.get("/list")
def get_list_quest():
    return get_question()
