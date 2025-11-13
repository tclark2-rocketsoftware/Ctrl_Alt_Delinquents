import sqlite3
import os
from datetime import datetime

# Connect to database
db_path = 'quizruption.db'
if not os.path.exists(db_path):
    print("❌ Database file not found!")
    print("   The backend server hasn't been started yet.")
    print("\n💡 To fix this:")
    print("   1. Navigate to: c:\\Users\\jheckel\\.vscode\\Ctrl_Alt_Delinquents")
    print("   2. Run: .\\run-backend.bat")
    print("   3. Wait for server to start, then try submitting a suggestion again")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='joke_suggestions'")
table_exists = cursor.fetchone()

print("=" * 80)
print("JOKE SUGGESTIONS DATABASE CHECK")
print("=" * 80)

if not table_exists:
    print("\n❌ The 'joke_suggestions' table doesn't exist yet!")
    print("\n💡 To fix this:")
    print("   1. Stop the backend server (Ctrl+C in the terminal)")
    print("   2. Restart it by running: .\\run-backend.bat")
    print("   3. The server will automatically create the new table")
    print("   4. Then submit your suggestion through the jokes page")
    
    # Show existing tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"\n📋 Current tables in database: {', '.join([t[0] for t in tables])}")
    conn.close()
    exit(0)

# Get column names
cursor.execute('PRAGMA table_info(joke_suggestions)')
columns = [col[1] for col in cursor.fetchall()]
print("\n✓ Table exists!")
print(f"Columns: {' | '.join(columns)}")
print("-" * 80)

# Get all suggestions
cursor.execute('SELECT * FROM joke_suggestions ORDER BY created_at DESC')
rows = cursor.fetchall()

if rows:
    print(f"\n✓ Found {len(rows)} suggestion(s):\n")
    for row in rows:
        print(f"  ID: {row[0]}")
        print(f"  Suggestion: '{row[1]}'")
        print(f"  User ID: {row[2] if row[2] else 'Anonymous'}")
        print(f"  Used: {'✓ Yes' if row[3] else '○ No'}")
        print(f"  Created: {row[4]}")
        print("-" * 80)
else:
    print("\n⚠ No suggestions found in the database yet.")
    print("\n💡 Next steps:")
    print("   1. Make sure the backend server is running")
    print("   2. Go to the Daily Joke page in your browser")
    print("   3. Submit a suggestion in the form")
    print("   4. Check browser console (F12) for any errors")
    print("   5. Run this script again to verify")

# Also check daily jokes
print("\n" + "=" * 80)
print("DAILY JOKES CACHE")
print("=" * 80)
cursor.execute('SELECT date, source, joke FROM daily_jokes ORDER BY date DESC LIMIT 3')
jokes = cursor.fetchall()
if jokes:
    print(f"\n✓ Found {len(jokes)} cached joke(s):\n")
    for joke in jokes:
        print(f"  Date: {joke[0]}")
        print(f"  Source: {joke[1]}")
        print(f"  Joke: {joke[2][:80]}...")
        print("-" * 80)
else:
    print("\n○ No daily jokes cached yet (will be created on first visit)")

conn.close()
print("\n✓ Database check complete!")
