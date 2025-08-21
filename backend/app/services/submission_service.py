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

    # Calculate score if answers are provided (actual submission)
    if submission_in.answers and submission_in.answers.strip() != "[]":
        try:
            answers_data = json.loads(submission_in.answers)
            submission.score = calculate_score(db, submission.exam_schedule_id, answers_data)
        except Exception as e:
            submission.score = 0.0
    else:
        # Initial submission with empty answers
        submission.score = 0.0

    db.commit()
    db.refresh(submission)
    return submission

def get_submissions_by_student(db: Session, student_id: int):
    return db.query(Submission).filter(Submission.student_id == student_id).all()

def calculate_score(db: Session, exam_schedule_id: int, answers) -> float:
    """Calculate score based on answers"""
    try:
        # Convert answers to dict format if it's a list
        answers_dict = {}
        if isinstance(answers, list):
            # Frontend sends: [{"questionId":64,"selectedOption":"A","isAnswered":true}, ...]
            for answer in answers:
                if isinstance(answer, dict) and 'questionId' in answer and 'selectedOption' in answer:
                    answers_dict[str(answer['questionId'])] = answer['selectedOption']
        elif isinstance(answers, dict):
            # Already in correct format: {"64": "A", "65": "C", ...}
            answers_dict = answers
        else:
            return 0.0

        # Get exam schedule
        exam_schedule = db.query(ExamSchedule).filter(ExamSchedule.id == exam_schedule_id).first()
        if not exam_schedule:
            return 0.0

        # Get exam
        exam = db.query(Exam).filter(Exam.id == exam_schedule.exam_id).first()
        if not exam:
            return 0.0

        # Get questions for this exam through exam_questions table
        from ..models.exam import ExamQuestion
        exam_questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam.id).all()

        total_score = 0.0
        total_possible = 0.0

        for exam_question in exam_questions:
            # Get the actual question
            question = db.query(Question).filter(Question.id == exam_question.question_id).first()
            if not question:
                continue

            # Get student's answer for this question
            question_id_str = str(question.id)
            student_answer = answers_dict.get(question_id_str)

            # Question mark (default to 1 if not set)
            question_mark = question.mark if question.mark else 1.0
            total_possible += question_mark

            # Check if answer is correct
            if student_answer and student_answer.strip().upper() == question.answer.strip().upper():
                total_score += question_mark

        return total_score

    except Exception as e:
        return 0.0