import sqlite3

conn = sqlite3.connect('quizruption.db')
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print('Tables:', tables)

# Check users table structure
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
print('\nUsers table columns:')
for col in columns:
    print(f"  {col[1]} ({col[2]})")

# Try to count users
cursor.execute("SELECT COUNT(*) FROM users")
count = cursor.fetchone()[0]
print(f'\nTotal users: {count}')

conn.close()
