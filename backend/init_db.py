"""
Database initialization and migration utilities
"""
from app.db.database import engine, Base
from app.models.user import User  # Import để đăng ký model với Base

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    # User model needs to be imported to be registered with Base
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

def drop_tables():
    """Drop all database tables"""
    print("Dropping database tables...")
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped successfully!")

if __name__ == "__main__":
    create_tables()
