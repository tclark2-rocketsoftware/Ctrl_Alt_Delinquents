"""Migration script to adapt legacy backup.db to the new schema defined in schema.sql.

Creates a new SQLite database migrated.db with the updated schema and
copies/transforms data from backup.db.

Assumptions (fabricated where legacy data lacks fields):
- users.username did not exist: derive from email prefix; ensure uniqueness by appending _n if needed.
- daily_jokes.source did not exist: set to 'fallback'.
- quizzes.created_by missing: set NULL.
- results.user_id & results.personality may be missing: set NULL.
- If answers.personality_tag missing, insert NULL.
- Timestamps reused when present; else CURRENT_TIMESTAMP default applies.
- Any duplicate personality_content.personality entries beyond the first are skipped to satisfy UNIQUE.

Usage:
    python quizruption/database/migrate_backup.py

Outputs quizruption/database/migrated.db
"""
from __future__ import annotations
import sqlite3
from pathlib import Path
import re

SOURCE_DB = Path(__file__).parent.parent / "backup.db"
TARGET_DB = Path(__file__).parent / "migrated.db"
SCHEMA_FILE = Path(__file__).parent / "schema.sql"

def load_schema() -> str:
    return SCHEMA_FILE.read_text(encoding="utf-8")

def get_columns(cur: sqlite3.Cursor, table: str) -> list[str]:
    cur.execute(f"PRAGMA table_info({table})")
    return [row[1] for row in cur.fetchall()]

def derive_username(email: str, used: set[str]) -> str:
    base = email.split("@", 1)[0]
    # Sanitize to allowed characters (alphanum + underscore)
    base = re.sub(r"[^A-Za-z0-9_]", "_", base)[:50]
    candidate = base
    i = 1
    while candidate in used:
        candidate = f"{base}_{i}"
        i += 1
    used.add(candidate)
    return candidate

def copy_users(src_cur: sqlite3.Cursor, dst_cur: sqlite3.Cursor):
    src_cols = get_columns(src_cur, "users")
    # Expected legacy: id, email, password_hash, created_at, updated_at maybe; possibly username absent
    src_cur.execute("SELECT * FROM users")
    rows = src_cur.fetchall()
    email_idx = src_cols.index("email") if "email" in src_cols else None
    pwd_idx = src_cols.index("password_hash") if "password_hash" in src_cols else None
    created_idx = src_cols.index("created_at") if "created_at" in src_cols else None
    updated_idx = src_cols.index("updated_at") if "updated_at" in src_cols else None
    username_present = "username" in src_cols
    username_idx = src_cols.index("username") if username_present else None

    used_usernames: set[str] = set()
    for row in rows:
        email = row[email_idx] if email_idx is not None else "user@example.com"
        password_hash = row[pwd_idx] if pwd_idx is not None else ""
        created_at = row[created_idx] if created_idx is not None else None
        updated_at = row[updated_idx] if updated_idx is not None else created_at
        username = row[username_idx] if username_present else derive_username(email, used_usernames)
        dst_cur.execute(
            """INSERT INTO users (username, email, password_hash, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)""",
            (username, email, password_hash, created_at, updated_at)
        )

def copy_quizzes(src_cur: sqlite3.Cursor, dst_cur: sqlite3.Cursor):
    src_cols = get_columns(src_cur, "quizzes")
    # Legacy likely lacks created_by
    src_cur.execute("SELECT * FROM quizzes")
    rows = src_cur.fetchall()
    title_idx = src_cols.index("title") if "title" in src_cols else None
    desc_idx = src_cols.index("description") if "description" in src_cols else None
    type_idx = src_cols.index("type") if "type" in src_cols else None
    created_at_idx = src_cols.index("created_at") if "created_at" in src_cols else None
    created_by_idx = src_cols.index("created_by") if "created_by" in src_cols else None

    for row in rows:
        title = row[title_idx] if title_idx is not None else "Untitled Quiz"
        description = row[desc_idx] if desc_idx is not None else None
        qtype = row[type_idx] if type_idx is not None else "trivia"
        created_at = row[created_at_idx] if created_at_idx is not None else None
        created_by = row[created_by_idx] if created_by_idx is not None else None
        dst_cur.execute(
            "INSERT INTO quizzes (title, description, type, created_by, created_at) VALUES (?, ?, ?, ?, ?)",
            (title, description, qtype, created_by, created_at)
        )

def copy_questions(src_cur: sqlite3.Cursor, dst_cur: sqlite3.Cursor):
    src_cols = get_columns(src_cur, "questions")
    src_cur.execute("SELECT * FROM questions")
    rows = src_cur.fetchall()
    quiz_idx = src_cols.index("quiz_id") if "quiz_id" in src_cols else None
    text_idx = src_cols.index("text") if "text" in src_cols else None
    for row in rows:
        quiz_id = row[quiz_idx] if quiz_idx is not None else None
        text = row[text_idx] if text_idx is not None else "(missing question text)"
        dst_cur.execute("INSERT INTO questions (quiz_id, text) VALUES (?, ?)", (quiz_id, text))

def copy_answers(src_cur: sqlite3.Cursor, dst_cur: sqlite3.Cursor):
    src_cols = get_columns(src_cur, "answers")
    src_cur.execute("SELECT * FROM answers")
    rows = src_cur.fetchall()
    q_idx = src_cols.index("question_id") if "question_id" in src_cols else None
    text_idx = src_cols.index("text") if "text" in src_cols else None
    correct_idx = src_cols.index("is_correct") if "is_correct" in src_cols else None
    tag_idx = src_cols.index("personality_tag") if "personality_tag" in src_cols else None
    for row in rows:
        question_id = row[q_idx] if q_idx is not None else None
        text = row[text_idx] if text_idx is not None else "(missing answer text)"
        is_correct = row[correct_idx] if correct_idx is not None else 0
        personality_tag = row[tag_idx] if tag_idx is not None else None
        dst_cur.execute(
            "INSERT INTO answers (question_id, text, is_correct, personality_tag) VALUES (?, ?, ?, ?)",
            (question_id, text, is_correct, personality_tag)
        )

def copy_results(src_cur: sqlite3.Cursor, dst_cur: sqlite3.Cursor):
    if "results" not in [r[0] for r in src_cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]:
        return
    src_cols = get_columns(src_cur, "results")
    src_cur.execute("SELECT * FROM results")
    rows = src_cur.fetchall()
    quiz_idx = src_cols.index("quiz_id") if "quiz_id" in src_cols else None
    score_idx = src_cols.index("score") if "score" in src_cols else None
    personality_idx = src_cols.index("personality") if "personality" in src_cols else None
    user_idx = src_cols.index("user_id") if "user_id" in src_cols else None
    created_at_idx = src_cols.index("created_at") if "created_at" in src_cols else None
    for row in rows:
        quiz_id = row[quiz_idx] if quiz_idx is not None else None
        score = row[score_idx] if score_idx is not None else None
        personality = row[personality_idx] if personality_idx is not None else None
        user_id = row[user_idx] if user_idx is not None else None
        created_at = row[created_at_idx] if created_at_idx is not None else None
        dst_cur.execute(
            "INSERT INTO results (quiz_id, user_id, score, personality, created_at) VALUES (?, ?, ?, ?, ?)",
            (quiz_id, user_id, score, personality, created_at)
        )

def copy_personality_content(src_cur: sqlite3.Cursor, dst_cur: sqlite3.Cursor):
    if "personality_content" not in [r[0] for r in src_cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]:
        return
    src_cols = get_columns(src_cur, "personality_content")
    src_cur.execute("SELECT * FROM personality_content")
    rows = src_cur.fetchall()
    personality_idx = src_cols.index("personality") if "personality" in src_cols else None
    quote_idx = src_cols.index("quote") if "quote" in src_cols else None
    gif_idx = src_cols.index("gif_url") if "gif_url" in src_cols else None
    joke_idx = src_cols.index("joke") if "joke" in src_cols else None
    seen: set[str] = set()
    for row in rows:
        personality = row[personality_idx] if personality_idx is not None else None
        if personality in seen:
            continue
        seen.add(personality)
        quote = row[quote_idx] if quote_idx is not None else None
        gif_url = row[gif_idx] if gif_idx is not None else None
        joke = row[joke_idx] if joke_idx is not None else None
        dst_cur.execute(
            "INSERT OR IGNORE INTO personality_content (personality, quote, gif_url, joke) VALUES (?, ?, ?, ?)",
            (personality, quote, gif_url, joke)
        )

def copy_daily_jokes(src_cur: sqlite3.Cursor, dst_cur: sqlite3.Cursor):
    if "daily_jokes" not in [r[0] for r in src_cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]:
        return
    src_cols = get_columns(src_cur, "daily_jokes")
    src_cur.execute("SELECT * FROM daily_jokes")
    rows = src_cur.fetchall()
    date_idx = src_cols.index("date") if "date" in src_cols else None
    joke_idx = src_cols.index("joke") if "joke" in src_cols else None
    source_idx = src_cols.index("source") if "source" in src_cols else None
    created_at_idx = src_cols.index("created_at") if "created_at" in src_cols else None
    for row in rows:
        date_val = row[date_idx] if date_idx is not None else None
        joke_val = row[joke_idx] if joke_idx is not None else None
        source_val = row[source_idx] if source_idx is not None else "fallback"
        created_at = row[created_at_idx] if created_at_idx is not None else None
        dst_cur.execute(
            "INSERT INTO daily_jokes (date, joke, source, created_at) VALUES (?, ?, ?, ?)",
            (date_val, joke_val, source_val, created_at)
        )

def copy_joke_suggestions(src_cur: sqlite3.Cursor, dst_cur: sqlite3.Cursor):
    if "joke_suggestions" not in [r[0] for r in src_cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]:
        return
    src_cols = get_columns(src_cur, "joke_suggestions")
    src_cur.execute("SELECT * FROM joke_suggestions")
    rows = src_cur.fetchall()
    text_idx = src_cols.index("suggestion_text") if "suggestion_text" in src_cols else None
    user_idx = src_cols.index("user_id") if "user_id" in src_cols else None
    used_idx = src_cols.index("used") if "used" in src_cols else None
    created_idx = src_cols.index("created_at") if "created_at" in src_cols else None
    for row in rows:
        suggestion_text = row[text_idx] if text_idx is not None else None
        user_id = row[user_idx] if user_idx is not None else None
        used = row[used_idx] if used_idx is not None else 0
        created_at = row[created_idx] if created_idx is not None else None
        dst_cur.execute(
            "INSERT INTO joke_suggestions (suggestion_text, user_id, used, created_at) VALUES (?, ?, ?, ?)",
            (suggestion_text, user_id, used, created_at)
        )

COPY_TASKS = [
    copy_users,
    copy_quizzes,
    copy_questions,
    copy_answers,
    copy_results,
    copy_personality_content,
    copy_daily_jokes,
    copy_joke_suggestions,
]

def migrate():
    if not SOURCE_DB.exists():
        raise FileNotFoundError(f"Source DB not found: {SOURCE_DB}")
    if TARGET_DB.exists():
        TARGET_DB.unlink()  # start fresh
    schema_sql = load_schema()

    src_con = sqlite3.connect(str(SOURCE_DB))
    dst_con = sqlite3.connect(str(TARGET_DB))
    try:
        dst_cur = dst_con.cursor()
        dst_cur.executescript(schema_sql)
        src_cur = src_con.cursor()
        for task in COPY_TASKS:
            task(src_cur, dst_cur)
        dst_con.commit()
    finally:
        src_con.close()
        dst_con.close()

    # Simple verification: print counts
    con = sqlite3.connect(str(TARGET_DB))
    try:
        cur = con.cursor()
        print("Migration complete. Row counts:")
        for table in ["users", "quizzes", "questions", "answers", "results", "personality_content", "daily_jokes", "joke_suggestions"]:
            cur.execute("SELECT COUNT(*) FROM " + table)
            count = cur.fetchone()[0]
            print(f"  {table}: {count}")
    finally:
        con.close()

if __name__ == "__main__":
    migrate()
