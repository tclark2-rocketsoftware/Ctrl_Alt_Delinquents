# Database verification script
import sqlite3
import os

def verify_database():
    """Verify the database structure and show table information"""
    
    db_path = os.path.join(os.path.dirname(__file__), '..', 'quiz_app.db')
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            print("🔍 Database Verification Report")
            print("=" * 50)
            
            # Show all tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [table[0] for table in cursor.fetchall()]
            print(f"\n📊 Tables Found: {len(tables)}")
            
            for table in tables:
                if table != 'sqlite_sequence':
                    print(f"\n🔸 Table: {table}")
                    
                    # Show columns
                    cursor.execute(f"PRAGMA table_info({table})")
                    columns = cursor.fetchall()
                    for col in columns:
                        pk = " (PRIMARY KEY)" if col[5] else ""
                        nullable = " NOT NULL" if col[3] else ""
                        print(f"  • {col[1]}: {col[2]}{pk}{nullable}")
                    
                    # Show foreign keys
                    cursor.execute(f"PRAGMA foreign_key_list({table})")
                    fks = cursor.fetchall()
                    if fks:
                        print("  Foreign Keys:")
                        for fk in fks:
                            print(f"    ➤ {fk[3]} → {fk[2]}.{fk[4]}")
                    
                    # Show record count
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    print(f"  📊 Records: {count}")
            
            # Show indexes
            cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
            indexes = cursor.fetchall()
            print(f"\n🔍 Indexes: {[idx[0] for idx in indexes if not idx[0].startswith('sqlite_')]}")
            
            print("\n✅ Database verification completed successfully!")
            
    except Exception as e:
        print(f"❌ Database verification failed: {e}")

if __name__ == "__main__":
    verify_database()