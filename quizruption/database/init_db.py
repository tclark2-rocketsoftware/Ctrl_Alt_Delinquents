# Database initialization script for fresh setup
import sqlite3
import os

def init_database():
    """Initialize the database with all required tables for fresh setup"""
    
    db_path = os.path.join(os.path.dirname(__file__), '..', 'quiz_app.db')
    
    try:
        # Remove existing database if it exists (for fresh setup)
        if os.path.exists(db_path):
            os.remove(db_path)
            print("🗑️  Removed existing database for fresh setup")
        
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            print("🚀 Initializing fresh database...")
            
            # Read and execute schema
            schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
            with open(schema_path, 'r') as f:
                schema = f.read()
            
            cursor.executescript(schema)
            conn.commit()
            
            print("✅ Database initialized successfully!")
            
            # Verify tables exist
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [table[0] for table in cursor.fetchall()]
            print(f"📊 Created tables: {tables}")
            
            # Show table structures
            for table in tables:
                cursor.execute(f"PRAGMA table_info({table})")
                columns = cursor.fetchall()
                print(f"  📋 {table}: {[col[1] for col in columns]}")
    
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

if __name__ == "__main__":
    init_database()