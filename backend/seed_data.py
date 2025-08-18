#!/usr/bin/env python3
"""
Seed data script for the application
Run this script to populate the database with sample data
"""

import random
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models.user import User
from app.models.question import Question
from app.models.exam import Exam, ExamQuestion
from app.services.user_service import create_user, get_user_by_username
from app.services.question_service import create_question
from app.services.exam_service import create_exam, generate_exam_from_questions
from app.schemas.user import UserCreate
from app.schemas.question import QuestionCreate
from app.schemas.exam import ExamCreate, ExamGenerateRequest
from app.core.constants import UserRole

# Sample users data with different roles
SAMPLE_USERS = [
    {
        "username": "admin",
        "password": "admin123",
        "role": UserRole.ADMIN
    },
    {
        "username": "teacher1",
        "password": "teacher123",
        "role": UserRole.TEACHER
    },
    {
        "username": "teacher2",
        "password": "teacher456",
        "role": UserRole.TEACHER
    },
    {
        "username": "student1",
        "password": "student123",
        "role": UserRole.STUDENT
    },
    {
        "username": "student2",
        "password": "student456",
        "role": UserRole.STUDENT
    },
    {
        "username": "demo_user",
        "password": "demo123",
        "role": UserRole.STUDENT
    }
]

# Subjects for questions
SUBJECTS = ["Toán", "Lý", "Hóa", "Anh", "Văn"]

# Sample question templates for each subject
QUESTION_TEMPLATES = {
    "Toán": [
        {
            "content": "Tính giá trị của biểu thức: 2x + 3 = 11. Giá trị của x là:",
            "choices": ["x = 4", "x = 5", "x = 6", "x = 7"],
            "answer": "A"
        },
        {
            "content": "Diện tích hình vuông có cạnh 5cm là:",
            "choices": ["20 cm²", "25 cm²", "30 cm²", "35 cm²"],
            "answer": "B"
        },
        {
            "content": "Căn bậc hai của 64 là:",
            "choices": ["6", "7", "8", "9"],
            "answer": "C"
        }
    ],
    "Lý": [
        {
            "content": "Công thức tính vận tốc là:",
            "choices": ["v = s/t", "v = s*t", "v = t/s", "v = s + t"],
            "answer": "A"
        },
        {
            "content": "Đơn vị đo cường độ dòng điện là:",
            "choices": ["Volt", "Ampe", "Ohm", "Watt"],
            "answer": "B"
        },
        {
            "content": "Gia tốc trọng trường trên Trái Đất xấp xỉ:",
            "choices": ["8.8 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"],
            "answer": "B"
        }
    ],
    "Hóa": [
        {
            "content": "Công thức hóa học của nước là:",
            "choices": ["H₂O", "CO₂", "NaCl", "CaCO₃"],
            "answer": "A"
        },
        {
            "content": "Nguyên tố có ký hiệu hóa học Na là:",
            "choices": ["Nitơ", "Natri", "Niken", "Neon"],
            "answer": "B"
        },
        {
            "content": "pH của dung dịch trung tính là:",
            "choices": ["6", "7", "8", "9"],
            "answer": "B"
        }
    ],
    "Anh": [
        {
            "content": "Choose the correct form: 'I _____ to school every day.'",
            "choices": ["go", "goes", "going", "went"],
            "answer": "A"
        },
        {
            "content": "What is the past tense of 'eat'?",
            "choices": ["eated", "ate", "eaten", "eating"],
            "answer": "B"
        },
        {
            "content": "Which word means 'beautiful'?",
            "choices": ["ugly", "pretty", "bad", "sad"],
            "answer": "B"
        }
    ],
    "Văn": [
        {
            "content": "Tác giả của tác phẩm 'Truyện Kiều' là:",
            "choices": ["Nguyễn Du", "Hồ Xuân Hương", "Nguyễn Trãi", "Lý Thái Tổ"],
            "answer": "A"
        },
        {
            "content": "Thể thơ lục bát có bao nhiêu tiếng trong một câu?",
            "choices": ["6 và 8 tiếng", "7 và 8 tiếng", "5 và 7 tiếng", "8 và 6 tiếng"],
            "answer": "A"
        },
        {
            "content": "Từ loại nào chỉ tên gọi của sự vật, hiện tượng?",
            "choices": ["Động từ", "Danh từ", "Tính từ", "Trạng từ"],
            "answer": "B"
        }
    ]
}

def create_tables():
    """Create all tables"""
    print("Creating database tables...")
    from app.db.database import Base
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

def seed_users(db: Session):
    """Seed users data"""
    print("Seeding users...")

    created_count = 0
    skipped_count = 0

    for user_data in SAMPLE_USERS:
        # Check if user already exists
        existing_user = get_user_by_username(db, username=user_data["username"])

        if existing_user:
            print(f"⏭️  User '{user_data['username']}' already exists, skipping...")
            skipped_count += 1
            continue

        # Create new user
        user_create = UserCreate(
            username=user_data["username"],
            password=user_data["password"],
            role=user_data["role"]
        )

        try:
            created_user = create_user(db, user_create)
            print(f"✅ Created user: {created_user.username} ({created_user.role}) - ID: {created_user.id}")
            created_count += 1
        except Exception as e:
            print(f"❌ Error creating user '{user_data['username']}': {e}")

    print(f"\n📊 Summary:")
    print(f"   - Created: {created_count} users")
    print(f"   - Skipped: {skipped_count} users")

def seed_questions(db: Session):
    """Seed questions data"""
    print("Seeding questions...")

    created_count = 0

    # Get teacher users for importer/editor fields
    teacher1 = get_user_by_username(db, "teacher1")
    teacher2 = get_user_by_username(db, "teacher2")

    if not teacher1 or not teacher2:
        print("❌ Teachers not found. Please seed users first.")
        return

    # Generate questions for each subject
    for subject in SUBJECTS:
        templates = QUESTION_TEMPLATES[subject]

        # Create about 20 questions per subject (100 total)
        for i in range(20):
            template = templates[i % len(templates)]

            # Add variation to questions
            question_num = i + 1
            content = f"[Câu {question_num}] {template['content']}"

            question_data = QuestionCreate(
                code=f"{subject[:2].upper()}{question_num:03d}",
                content=content,
                choiceA=template['choices'][0],
                choiceB=template['choices'][1],
                choiceC=template['choices'][2],
                choiceD=template['choices'][3],
                answer=template['answer'],
                mark=1.0,
                unit="Điểm",
                mix=True,
                subject=subject,
                lecturer=f"GV {subject}"
            )

            try:
                # Alternate between teachers as importers
                importer_id = teacher1.id if i % 2 == 0 else teacher2.id

                # Create question using service
                question = Question(
                    code=question_data.code,
                    content=question_data.content,
                    choiceA=question_data.choiceA,
                    choiceB=question_data.choiceB,
                    choiceC=question_data.choiceC,
                    choiceD=question_data.choiceD,
                    answer=question_data.answer,
                    mark=question_data.mark,
                    unit=question_data.unit,
                    mix=question_data.mix,
                    subject=question_data.subject,
                    lecturer=question_data.lecturer,
                    importer=importer_id,
                    editor=importer_id
                )

                db.add(question)
                created_count += 1

                if created_count % 10 == 0:
                    print(f"   Created {created_count} questions...")

            except Exception as e:
                print(f"❌ Error creating question {question_data.code}: {e}")

    db.commit()
    print(f"✅ Created {created_count} questions total")

def seed_exams(db: Session):
    """Seed sample exams"""
    print("Seeding exams...")

    created_count = 0
    skipped_count = 0

    # Get teacher users
    teacher1 = get_user_by_username(db, "teacher1")
    teacher2 = get_user_by_username(db, "teacher2")

    if not teacher1 or not teacher2:
        print("❌ Teachers not found. Please seed users first.")
        return

    # Sample exams
    sample_exams = [
        {
            "code": "TOAN_001",
            "title": "Kiểm tra Toán học - Đề 1",
            "subject": "Toán",
            "duration": 45,
            "total_questions": 10,
            "description": "Kiểm tra 45 phút môn Toán",
            "created_by": teacher1.id
        },
        {
            "code": "LY_001",
            "title": "Kiểm tra Vật lý - Đề 1",
            "subject": "Lý",
            "duration": 60,
            "total_questions": 15,
            "description": "Kiểm tra 1 tiết môn Vật lý",
            "created_by": teacher1.id
        },
        {
            "code": "HOA_001",
            "title": "Kiểm tra Hóa học - Đề 1",
            "subject": "Hóa",
            "duration": 45,
            "total_questions": 12,
            "description": "Kiểm tra 45 phút môn Hóa học",
            "created_by": teacher2.id
        },
        {
            "code": "ANH_001",
            "title": "English Test - Set 1",
            "subject": "Anh",
            "duration": 60,
            "total_questions": 20,
            "description": "English proficiency test",
            "created_by": teacher2.id
        },
        {
            "code": "VAN_001",
            "title": "Kiểm tra Ngữ văn - Đề 1",
            "subject": "Văn",
            "duration": 90,
            "total_questions": 8,
            "description": "Kiểm tra 2 tiết môn Ngữ văn",
            "created_by": teacher1.id
        }
    ]

    for exam_data in sample_exams:
        try:
            # Check if exam already exists
            existing_exam = db.query(Exam).filter(Exam.code == exam_data["code"]).first()
            if existing_exam:
                print(f"⏭️  Exam '{exam_data['code']}' already exists, skipping...")
                skipped_count += 1
                continue

            # Create exam
            exam = Exam(
                code=exam_data["code"],
                title=exam_data["title"],
                subject=exam_data["subject"],
                duration=exam_data["duration"],
                total_questions=exam_data["total_questions"],
                description=exam_data["description"],
                is_active=True,
                created_by=exam_data["created_by"]
            )

            db.add(exam)
            db.flush()  # Get exam ID

            # Get random questions for this subject
            questions = db.query(Question).filter(
                Question.subject == exam_data["subject"]
            ).limit(exam_data["total_questions"]).all()

            # Create exam questions with shuffled choices
            for order, question in enumerate(questions, 1):
                # Shuffle choice order
                choices = ["A", "B", "C", "D"]
                random.shuffle(choices)
                choice_order = ",".join(choices)

                exam_question = ExamQuestion(
                    exam_id=exam.id,
                    question_id=question.id,
                    question_order=order,
                    choice_order=choice_order
                )
                db.add(exam_question)

            created_count += 1
            print(f"✅ Created exam: {exam_data['title']}")

        except Exception as e:
            print(f"❌ Error creating exam {exam_data['code']}: {e}")

    db.commit()
    print(f"✅ Created {created_count} exams total")
    print(f"⏭️  Skipped {skipped_count} exams (already exist)")

def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    print("=" * 50)

    # Create tables first
    create_tables()
    print()

    # Get database session
    db = SessionLocal()

    try:
        # Seed users first
        seed_users(db)
        print()

        # Seed questions
        seed_questions(db)
        print()

        # Seed exams
        seed_exams(db)

        print("\n🎉 Database seeding completed successfully!")
        print("\n� Summary:")
        print("=" * 50)
        print("👥 Users: 6 accounts created")
        print("❓ Questions: ~100 questions across 5 subjects")
        print("📝 Exams: 5 sample exams created")
        print()
        print("�📋 Sample login credentials:")
        print("=" * 50)
        print("🔐 Admin Account:")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Role: ADMIN")
        print()
        print("👨‍🏫 Teacher Accounts:")
        print("   Username: teacher1 | Password: teacher123")
        print("   Username: teacher2 | Password: teacher456")
        print()
        print("👨‍🎓 Student Accounts:")
        print("   Username: student1 | Password: student123")
        print("   Username: student2 | Password: student456")
        print("   Username: demo_user | Password: demo123")
        print()
        print("📚 Subjects available: Toán, Lý, Hóa, Anh, Văn")
        print("💡 Note: You can also register new accounts via the frontend")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
