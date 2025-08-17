#!/usr/bin/env python3
"""
Seed data script for the application
Run this script to populate the database with sample data
"""

import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models.user import User
from app.services.user_service import create_user, get_user_by_username
from app.schemas.user import UserCreate
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

def create_tables():
    """Create all tables"""
    print("Creating database tables...")
    User.metadata.create_all(bind=engine)
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
        # Seed users
        seed_users(db)

        print("\n🎉 Database seeding completed successfully!")
        print("\n📋 Sample login credentials:")
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
        print("💡 Note: You can also register new accounts via the frontend")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
