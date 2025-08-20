import json
from sqlalchemy.orm import Session
from ..models.submission import Submission
from ..models.exam_schedule import ExamSchedule
from ..models.exam import Exam
from ..models.question import Question
from ..schemas.submission import SubmissionCreate

def create_submission(db: Session, student_id: int, submission_in: SubmissionCreate) -> Submission:
    submission = Submission(
        student_id=student_id,
        exam_schedule_id=submission_in.exam_schedule_id,
        answers=submission_in.answers,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Tính điểm sau khi lưu
    try:
        answers_dict = json.loads(submission.answers)
    except Exception:
        answers_dict = {}
    submission.score = calculate_score(db, submission.exam_schedule_id, answers_dict)
    db.commit()
    db.refresh(submission)
    return submission

def get_submissions_by_student(db: Session, student_id: int):
    return db.query(Submission).filter(Submission.student_id == student_id).all()

def calculate_score(db: Session, exam_schedule_id: int, answers: dict) -> float:
    exam_schedule = db.query(ExamSchedule).get(exam_schedule_id)
    if not exam_schedule:
        return 0.0
    exam = db.query(Exam).get(exam_schedule.exam_id)
    if not exam:
        return 0.0
    questions = db.query(Question).filter(Question.exam_id == exam.id).all()
    score = 0.0
    for q in questions:
        # Nếu câu hỏi có điểm riêng
        mark = getattr(q, "mark", 1)
        # So sánh đáp án sinh viên với đáp án đúng
        student_answer = answers.get(str(q.id)) or answers.get(q.id)
        if student_answer is not None and student_answer == q.correct_answer:
            score += mark
    return score