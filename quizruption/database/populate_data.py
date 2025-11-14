"""Populate the quizruption.sqlite database with sample data.
Idempotent: skips creation if a given record (by unique fields) already exists.
Run:  python database/populate_data.py
"""
import os
import sys
from datetime import datetime

# Ensure app package importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.database import Base, SQLALCHEMY_DATABASE_URL
from app.models import User, Quiz, Question, Answer, Result, JokeSuggestion, PersonalityContent
from sqlalchemy import text

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------

def get_or_create_user(session, username, email, password, **extra):
    user = session.query(User).filter_by(username=username).first()
    if user:
        return user, False
    user = User(username=username, email=email, **extra)
    user.set_password(password)
    session.add(user)
    return user, True


def create_personality_quiz(session, creator, title, description, questions):
    existing = session.query(Quiz).filter_by(title=title).first()
    if existing:
        return existing, False
    quiz = Quiz(title=title, description=description, type='personality', created_by=creator.id if creator else None)
    session.add(quiz)
    session.flush()  # get quiz.id
    for q_text, answers in questions:
        q = Question(quiz_id=quiz.id, text=q_text)
        session.add(q)
        session.flush()
        for answer_text, personality_tag in answers:
            a = Answer(question_id=q.id, text=answer_text, personality_tag=personality_tag)
            session.add(a)
    return quiz, True


def create_trivia_quiz(session, creator, title, description, questions):
    existing = session.query(Quiz).filter_by(title=title).first()
    if existing:
        return existing, False
    quiz = Quiz(title=title, description=description, type='trivia', created_by=creator.id if creator else None)
    session.add(quiz)
    session.flush()
    for q_text, answers, correct_index in questions:
        q = Question(quiz_id=quiz.id, text=q_text)
        session.add(q)
        session.flush()
        for idx, answer_text in enumerate(answers):
            a = Answer(question_id=q.id, text=answer_text, is_correct=(idx == correct_index))
            session.add(a)
    return quiz, True


def create_funny_personality_quiz(session, creator):
    title = "What Kind of Meme Brain Do You Have?"
    description = "A light-hearted personality quiz assigning humorous archetypes."
    questions = [
        ("Pick a reaction image:", [
            ("Distracted Boyfriend", "Trend Chaser"),
            ("Woman Yelling at Cat", "Drama Strategist"),
            ("Galaxy Brain", "Meta Thinker"),
            ("Grumpy Cat", "Classic Curator")
        ]),
        ("Your go-to response to bad code:", [
            ("Add TODO and move on", "Pragmatic"),
            ("Refactor everything now", "Perfectionist"),
            ("Write a meme in comments", "Humor Driven"),
            ("Cry internally", "Empath")
        ]),
    ]
    return create_personality_quiz(session, creator, title, description, questions)


def create_personality_content(session):
    # Only create if table empty
    if session.query(PersonalityContent).count() > 0:
        return 0
    entries = [
        {"personality": "Leader", "quote": "Lead from the front.", "gif_url": "https://example.com/leader.gif", "joke": "Why did the leader cross the road? To delegate walking."},
        {"personality": "Creative", "quote": "Create, iterate, inspire.", "gif_url": "https://example.com/creative.gif", "joke": "My code is abstract art."},
        {"personality": "Analyst", "quote": "Data tells the story.", "gif_url": "https://example.com/analyst.gif", "joke": "I have charts for my charts."},
        {"personality": "Trend Chaser", "quote": "Latest is greatest.", "gif_url": "https://example.com/trend.gif", "joke": "I refactor weekly for fashion."},
    ]
    for e in entries:
        session.add(PersonalityContent(**e))
    return len(entries)


def create_joke_suggestions(session, users):
    samples = [
        ("Why do programmers prefer dark mode? Because light attracts bugs.", users[0]),
        ("I told my computer a joke, but it didn't get the punchline.", users[1] if len(users) > 1 else None),
        ("Debugging: Removing needles from a haystack.", users[2] if len(users) > 2 else None),
        ("My code works... until someone looks at it.", users[0]),
    ]
    created = 0
    for text, user in samples:
        exists = session.query(JokeSuggestion).filter_by(suggestion_text=text).first()
        if not exists:
            session.add(JokeSuggestion(suggestion_text=text, user_id=user.id if user else None))
            created += 1
    return created


# ---------------------------------------------------------------------
# Main population routine
# ---------------------------------------------------------------------

def main():
    # Ensure any missing columns (simple, manual migration for SQLite)
    with engine.connect() as conn:
        # List of (table, column, type) to ensure exists
        required_columns = [
            ("quizzes", "personalities", "TEXT"),
            ("answers", "personality_weights", "TEXT"),
            ("results", "personality_data", "TEXT"),
        ]
        for table, column, coltype in required_columns:
            result = conn.execute(text(f"PRAGMA table_info({table})"))
            cols = [row[1] for row in result]
            if column not in cols:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}"))
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        created_summary = {}

        # Users
        users_specs = [
            ("Turtle", "turtles@email.com", "password123", {"location": "Rogers"}),
            ("Alice", "alice@example.com", "alicePass!", {"location": "Wonderland", "bio": "Curious explorer"}),
            ("Bob", "bob@example.com", "bobSecure#1", {"bio": "Builder of things"}),
            ("Charlie", "charlie@example.com", "charlieDev2025", {"bio": "Data enthusiast"}),
        ]
        users = []
        new_users = 0
        for username, email, password, extra in users_specs:
            user, created = get_or_create_user(session, username, email, password, **extra)
            users.append(user)
            if created:
                new_users += 1
        created_summary['users_created'] = new_users

        # Personality Quiz
        personality_questions = [
            ("You prefer to solve problems:", [
                ("Logically and systematically", "Analyst"),
                ("Creatively with wild ideas", "Creative"),
                ("By coordinating a team", "Leader"),
                ("By googling past solutions", "Trend Chaser")
            ]),
            ("In a group project, you usually:", [
                ("Organize tasks and timelines", "Leader"),
                ("Provide innovative concepts", "Creative"),
                ("Ensure quality and consistency", "Analyst"),
                ("Keep morale high with humor", "Creative")
            ]),
        ]
        personality_quiz, personality_created = create_personality_quiz(
            session,
            users[0],
            "Find Your Tech Persona",
            "Discover your role archetype in a dev team.",
            personality_questions
        )
        created_summary['personality_quiz_created'] = personality_created

        # Trivia Quiz
        trivia_questions = [
            ("What does HTTP stand for?", ["HyperText Transfer Protocol", "HighText Transfer Package", "Home Tool Transfer Protocol", "Hyperlink Transfer Program"], 0),
            ("Which language runs in a web browser?", ["Java", "C", "Python", "JavaScript"], 3),
            ("What does CSS stand for?", ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Colorful Style Syntax"], 0),
        ]
        trivia_quiz, trivia_created = create_trivia_quiz(
            session,
            users[1],
            "Starter Dev Trivia",
            "Basic development and web fundamentals quiz.",
            trivia_questions
        )
        created_summary['trivia_quiz_created'] = trivia_created

        # Funny Meme Personality Quiz
        funny_quiz, funny_created = create_funny_personality_quiz(session, users[2])
        created_summary['funny_quiz_created'] = funny_created

        # Personality content table
        pc_count = create_personality_content(session)
        created_summary['personality_content_added'] = pc_count

        # Joke suggestions
        jokes_added = create_joke_suggestions(session, users)
        created_summary['joke_suggestions_added'] = jokes_added

        session.commit()

        print("\nPopulation Summary:")
        for k, v in created_summary.items():
            print(f"  {k}: {v}")
        print("\nDone.")
    except IntegrityError as ie:
        session.rollback()
        print(f"Integrity error: {ie}")
    except Exception as e:
        session.rollback()
        print(f"Unexpected error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    main()
