# Database migration to add user profile fields
import sqlite3
import os

def migrate_user_profile():
    """Add profile fields to users table"""
    
    db_path = os.path.join(os.path.dirname(__file__), '..', 'quiz_app.db')
    
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            print("🔄 Adding user profile fields...")
            
            # Add new profile columns
            profile_columns = [
                "ALTER TABLE users ADD COLUMN display_name VARCHAR(100)",
                "ALTER TABLE users ADD COLUMN bio TEXT",
                "ALTER TABLE users ADD COLUMN location VARCHAR(100)", 
                "ALTER TABLE users ADD COLUMN website VARCHAR(255)",
                "ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500)",
                "ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            ]
            
            for sql in profile_columns:
                try:
                    cursor.execute(sql)
                    print(f"✅ Added column: {sql.split('ADD COLUMN')[1].split()[0]}")
                except sqlite3.OperationalError as e:
                    if "duplicate column name" in str(e):
                        print(f"⏭️ Column already exists: {sql.split('ADD COLUMN')[1].split()[0]}")
                    else:
                        print(f"❌ Error adding column: {e}")
            
            conn.commit()
            
            # Verify the changes
            cursor.execute("PRAGMA table_info(users)")
            columns = [col[1] for col in cursor.fetchall()]
            print(f"\n📊 Users table now has columns: {', '.join(columns)}")
            
            print("\n🎉 User profile migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    migrate_user_profile()