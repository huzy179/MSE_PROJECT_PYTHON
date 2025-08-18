import random
from typing import List, Optional

from sqlalchemy import and_, func
from sqlalchemy.orm import Session, joinedload

from ..models.exam import Exam, ExamQuestion
from ..models.question import Question
from ..models.user import User
from ..schemas.exam import ExamCreate, ExamGenerateRequest, ExamUpdate


class ExamService:
    @staticmethod
    def create_exam(db: Session, exam: ExamCreate, created_by: int) -> Exam:
        """Create a new exam"""
        db_exam = Exam(
            code=exam.code,
            title=exam.title,
            subject=exam.subject,
            duration=exam.duration,
            total_questions=exam.total_questions,
            description=exam.description,
            is_active=exam.is_active,
            created_by=created_by,
        )
        db.add(db_exam)
        db.commit()
        db.refresh(db_exam)
        return db_exam

    @staticmethod
    def get_exam_by_id(
        db: Session, exam_id: int, include_deleted: bool = False
    ) -> Optional[Exam]:
        """Get exam by ID"""
        query = db.query(Exam).filter(Exam.id == exam_id)
        if not include_deleted:
            query = query.filter(Exam.deleted_at.is_(None))
        return query.first()

    @staticmethod
    def get_exam_by_code(
        db: Session, code: str, include_deleted: bool = False
    ) -> Optional[Exam]:
        """Get exam by code"""
        query = db.query(Exam).filter(Exam.code == code)
        if not include_deleted:
            query = query.filter(Exam.deleted_at.is_(None))
        return query.first()

    @staticmethod
    def get_exams(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        subject: Optional[str] = None,
        created_by: Optional[int] = None,
        include_deleted: bool = False,
    ) -> List[Exam]:
        """Get list of exams with pagination and filters"""
        query = db.query(Exam)
        
        if not include_deleted:
            query = query.filter(Exam.deleted_at.is_(None))
        
        if subject:
            query = query.filter(Exam.subject == subject)
        
        if created_by:
            query = query.filter(Exam.created_by == created_by)
        
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_exams_count(
        db: Session,
        subject: Optional[str] = None,
        created_by: Optional[int] = None,
        include_deleted: bool = False,
    ) -> int:
        """Get total count of exams"""
        query = db.query(func.count(Exam.id))
        
        if not include_deleted:
            query = query.filter(Exam.deleted_at.is_(None))
        
        if subject:
            query = query.filter(Exam.subject == subject)
        
        if created_by:
            query = query.filter(Exam.created_by == created_by)
        
        return query.scalar()

    @staticmethod
    def update_exam(db: Session, exam_id: int, exam_update: ExamUpdate) -> Optional[Exam]:
        """Update exam"""
        db_exam = ExamService.get_exam_by_id(db, exam_id)
        if not db_exam:
            return None

        update_data = exam_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_exam, field, value)

        db.commit()
        db.refresh(db_exam)
        return db_exam

    @staticmethod
    def soft_delete_exam(db: Session, exam_id: int) -> bool:
        """Soft delete exam"""
        db_exam = ExamService.get_exam_by_id(db, exam_id)
        if not db_exam:
            return False

        db_exam.deleted_at = func.now()
        db.commit()
        return True

    @staticmethod
    def restore_exam(db: Session, exam_id: int) -> bool:
        """Restore soft deleted exam"""
        db_exam = ExamService.get_exam_by_id(db, exam_id, include_deleted=True)
        if not db_exam or db_exam.deleted_at is None:
            return False

        db_exam.deleted_at = None
        db.commit()
        return True

    @staticmethod
    def get_exam_with_questions(db: Session, exam_id: int) -> Optional[Exam]:
        """Get exam with its questions"""
        return (
            db.query(Exam)
            .options(joinedload(Exam.exam_questions))
            .filter(Exam.id == exam_id)
            .filter(Exam.deleted_at.is_(None))
            .first()
        )

    @staticmethod
    def generate_exam_from_questions(
        db: Session, exam_request: ExamGenerateRequest, created_by: int
    ) -> Optional[Exam]:
        """Generate a new exam by randomly selecting questions from the subject"""
        # Check if exam code already exists
        existing_exam = ExamService.get_exam_by_code(db, exam_request.code)
        if existing_exam:
            return None

        # Get available questions for the subject
        available_questions = (
            db.query(Question)
            .filter(Question.subject == exam_request.subject)
            .filter(Question.deleted_at.is_(None))
            .all()
        )

        if len(available_questions) < exam_request.total_questions:
            return None  # Not enough questions available

        # Randomly select questions
        selected_questions = random.sample(available_questions, exam_request.total_questions)

        # Create the exam
        db_exam = Exam(
            code=exam_request.code,
            title=exam_request.title,
            subject=exam_request.subject,
            duration=exam_request.duration,
            total_questions=exam_request.total_questions,
            description=exam_request.description,
            is_active=True,
            created_by=created_by,
        )
        db.add(db_exam)
        db.flush()  # Get the exam ID

        # Create exam questions with shuffled choices
        for order, question in enumerate(selected_questions, 1):
            # Shuffle choice order if requested
            choice_order = "A,B,C,D"  # Default order
            if exam_request.shuffle_choices:
                choices = ["A", "B", "C", "D"]
                random.shuffle(choices)
                choice_order = ",".join(choices)

            exam_question = ExamQuestion(
                exam_id=db_exam.id,
                question_id=question.id,
                question_order=order,
                choice_order=choice_order,
            )
            db.add(exam_question)

        db.commit()
        db.refresh(db_exam)
        return db_exam

    @staticmethod
    def get_subjects(db: Session) -> List[str]:
        """Get list of available subjects from questions"""
        subjects = (
            db.query(Question.subject)
            .filter(Question.subject.isnot(None))
            .filter(Question.deleted_at.is_(None))
            .distinct()
            .all()
        )
        return [subject[0] for subject in subjects if subject[0]]


# Backward compatibility functions
def create_exam(db: Session, exam: ExamCreate, created_by: int) -> Exam:
    return ExamService.create_exam(db, exam, created_by)


def get_exam_by_id(
    db: Session, exam_id: int, include_deleted: bool = False
) -> Optional[Exam]:
    return ExamService.get_exam_by_id(db, exam_id, include_deleted)


def get_exam_by_code(
    db: Session, code: str, include_deleted: bool = False
) -> Optional[Exam]:
    return ExamService.get_exam_by_code(db, code, include_deleted)


def get_exams(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    subject: Optional[str] = None,
    created_by: Optional[int] = None,
    include_deleted: bool = False,
) -> List[Exam]:
    return ExamService.get_exams(db, skip, limit, subject, created_by, include_deleted)


def get_exams_count(
    db: Session,
    subject: Optional[str] = None,
    created_by: Optional[int] = None,
    include_deleted: bool = False,
) -> int:
    return ExamService.get_exams_count(db, subject, created_by, include_deleted)


def update_exam(db: Session, exam_id: int, exam_update: ExamUpdate) -> Optional[Exam]:
    return ExamService.update_exam(db, exam_id, exam_update)


def soft_delete_exam(db: Session, exam_id: int) -> bool:
    return ExamService.soft_delete_exam(db, exam_id)


def restore_exam(db: Session, exam_id: int) -> bool:
    return ExamService.restore_exam(db, exam_id)


def get_exam_with_questions(db: Session, exam_id: int) -> Optional[Exam]:
    return ExamService.get_exam_with_questions(db, exam_id)


def generate_exam_from_questions(
    db: Session, exam_request: ExamGenerateRequest, created_by: int
) -> Optional[Exam]:
    return ExamService.generate_exam_from_questions(db, exam_request, created_by)


def get_subjects(db: Session) -> List[str]:
    return ExamService.get_subjects(db)
