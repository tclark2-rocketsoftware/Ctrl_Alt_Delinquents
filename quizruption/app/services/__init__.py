# Services package initialization
from app.insert_quiz_data import *
from app.models import Quiz



# If the database is empty, seed it with initial quiz data
def initialize_database(db):
    quiz_count = db.query(Quiz).count()
    if quiz_count == 0:
        insert_quizzes()
        print("Database initialized with quiz data.")

initialize_database(SessionLocal())