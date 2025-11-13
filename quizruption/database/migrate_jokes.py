# Database migration script to update joke_suggestions table with user relationship
import sqlite3
import os

def run_migration():
    """Run database migration to add foreign key to joke_suggestions"""
    
    # Get database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'quiz_app.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🚀 Starting joke_suggestions migration...")
        
        # Check if joke_suggestions table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='joke_suggestions'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            # Create joke_suggestions table with foreign key
            cursor.execute('''
                CREATE TABLE joke_suggestions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    suggestion_text TEXT NOT NULL,
                    user_id INTEGER,
                    used BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                )
            ''')
            print("✅ Created joke_suggestions table with foreign key")
        else:
            # Table exists - need to recreate with foreign key
            print("ℹ️  joke_suggestions table exists, checking structure...")
            
            # Get existing data
            cursor.execute("SELECT * FROM joke_suggestions")
            existing_data = cursor.fetchall()
            
            # Drop old table
            cursor.execute("DROP TABLE joke_suggestions")
            print("🗑️  Dropped old joke_suggestions table")
            
            # Create new table with foreign key
            cursor.execute('''
                CREATE TABLE joke_suggestions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    suggestion_text TEXT NOT NULL,
                    user_id INTEGER,
                    used BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                )
            ''')
            print("✅ Created new joke_suggestions table with foreign key")
            
            # Restore existing data
            if existing_data:
                for row in existing_data:
                    cursor.execute('''
                        INSERT INTO joke_suggestions (id, suggestion_text, user_id, used, created_at)
                        VALUES (?, ?, ?, ?, ?)
                    ''', row)
                print(f"✅ Restored {len(existing_data)} existing suggestions")
        
        # Create index for better performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_joke_suggestions_user_id ON joke_suggestions(user_id)')
        print("✅ Created index on user_id")
        
        conn.commit()
        print("\n🎉 Migration completed successfully!")
        
        # Show table structure
        cursor.execute("PRAGMA table_info(joke_suggestions)")
        columns = cursor.fetchall()
        print(f"\n📊 joke_suggestions table columns: {[col[1] for col in columns]}")
        
        cursor.execute("PRAGMA foreign_key_list(joke_suggestions)")
        fks = cursor.fetchall()
        if fks:
            print(f"🔗 Foreign keys: {fks}")
        
    except sqlite3.Error as e:
        print(f"❌ Migration failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_migration()
