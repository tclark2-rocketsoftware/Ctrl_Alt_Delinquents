# Database migration script to add user authentication support
import sqlite3
import os

def run_migration():
    """Run database migration to add user authentication support"""
    
    # Get database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'quiz_app.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🚀 Starting database migration...")
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                personality_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("✅ Created users table")
        
        # Check if user_id column exists in quizzes table
        cursor.execute("PRAGMA table_info(quizzes)")
        quiz_columns = [column[1] for column in cursor.fetchall()]
        
        if 'user_id' not in quiz_columns:
            cursor.execute('ALTER TABLE quizzes ADD COLUMN user_id INTEGER REFERENCES users(id)')
            print("✅ Added user_id to quizzes table")
        else:
            print("ℹ️  user_id already exists in quizzes table")
        
        # Check if user_id column exists in results table
        cursor.execute("PRAGMA table_info(results)")
        result_columns = [column[1] for column in cursor.fetchall()]
        
        if 'user_id' not in result_columns:
            cursor.execute('ALTER TABLE results ADD COLUMN user_id INTEGER REFERENCES users(id)')
            print("✅ Added user_id to results table")
        else:
            print("ℹ️  user_id already exists in results table")
        
        # Create indexes for better performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_results_quiz_id ON results(quiz_id)')
        print("✅ Created database indexes")
        
        conn.commit()
        print("\n🎉 Database migration completed successfully!")
        
        # Show current table structure
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"\n📊 Current database tables: {[table[0] for table in tables]}")
        
        # Show users table structure
        cursor.execute("PRAGMA table_info(users)")
        user_columns = cursor.fetchall()
        print(f"👤 Users table columns: {[col[1] for col in user_columns]}")
        
    except sqlite3.Error as e:
        print(f"❌ Database migration failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_migration()