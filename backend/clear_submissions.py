"""
Clear all submissions from database to fix validation issues
"""
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import get_db
from app.models.submission import Submission

def clear_submissions():
    """Clear all submissions from database"""
    db = next(get_db())
    
    try:
        # Get all submissions
        submissions = db.query(Submission).all()
        
        # Delete all submissions
        db.query(Submission).delete()
        db.commit()
        
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    clear_submissions()
