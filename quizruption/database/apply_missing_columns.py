"""Apply missing columns to an existing SQLite database (quizruption.db) to align
with current SQLAlchemy models defined in app/models.py.

Adds columns only if they do not already exist. Safe to re-run.
"""
from __future__ import annotations
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "quizruption.db"

TABLE_COLUMNS = {
    "users": [
        ("display_name", "TEXT"),
        ("bio", "TEXT"),
        ("location", "TEXT"),
        ("website", "TEXT"),
        ("profile_image_url", "TEXT"),
    ],
    "quizzes": [
        ("personalities", "TEXT"),
    ],
    "answers": [
        ("personality_weights", "TEXT"),
    ],
    "results": [
        ("personality_data", "TEXT"),
    ],
}

def get_existing_columns(cur: sqlite3.Cursor, table: str) -> set[str]:
    cur.execute(f"PRAGMA table_info({table})")
    return {row[1] for row in cur.fetchall()}

def apply():
    if not DB_PATH.exists():
        raise SystemExit(f"Database file not found: {DB_PATH}")
    con = sqlite3.connect(str(DB_PATH))
    try:
        cur = con.cursor()
        for table, cols in TABLE_COLUMNS.items():
            # Ensure table exists first
            cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
            if not cur.fetchone():
                print(f"[SKIP] Table '{table}' does not exist in DB.")
                continue
            existing = get_existing_columns(cur, table)
            for col_name, col_type in cols:
                if col_name in existing:
                    print(f"[OK] {table}.{col_name} already exists")
                    continue
                sql = f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"
                print(f"[ADD] {sql}")
                cur.execute(sql)
        con.commit()
    finally:
        con.close()
    print("Schema alignment complete.")

if __name__ == "__main__":
    apply()
