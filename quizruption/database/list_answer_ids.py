"""Utility: List answer IDs for a given quiz to help build submissions.
Run: python database/list_answer_ids.py <quiz_id>
"""
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SQLALCHEMY_DATABASE_URL
from app import models

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


def main():
    if len(sys.argv) < 2:
        print("Usage: python database/list_answer_ids.py <quiz_id>")
        return
    quiz_id = int(sys.argv[1])
    session = SessionLocal()
    try:
        quiz = session.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
        if not quiz:
            print(f"Quiz {quiz_id} not found")
            return
        print(f"Quiz {quiz.id}: {quiz.title} (type={quiz.type})")
        for q in quiz.questions:
            print(f"  Question {q.id}: {q.text}")
            for a in q.answers:
                tag = f" tag={a.personality_tag}" if a.personality_tag else ""
                correct = " (correct)" if a.is_correct else ""
                print(f"    Answer {a.id}: {a.text}{correct}{tag}")
    finally:
        session.close()

if __name__ == "__main__":
    main()
