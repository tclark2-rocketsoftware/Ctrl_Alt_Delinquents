# Clean up existing test data
import sqlite3
import os

def clean_database():
    """Remove existing test data to start fresh"""
    
    db_path = os.path.join(os.path.dirname(__file__), '..', 'quiz_app.db')
    
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            print("🧹 Cleaning up existing test data...")
            
            # Remove all existing data (in order to respect foreign keys)
            cursor.execute("DELETE FROM answers")
            cursor.execute("DELETE FROM questions") 
            cursor.execute("DELETE FROM results")
            cursor.execute("DELETE FROM quizzes")
            
            # Reset auto-increment sequences
            cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('answers', 'questions', 'results', 'quizzes')")
            
            conn.commit()
            
            # Verify cleanup
            for table in ['quizzes', 'questions', 'answers', 'results']:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"✅ {table}: {count} records remaining")
            
            print("\n🎉 Database cleaned successfully! Ready for fresh start.")
            
    except Exception as e:
        print(f"❌ Cleanup failed: {e}")

if __name__ == "__main__":
    clean_database()