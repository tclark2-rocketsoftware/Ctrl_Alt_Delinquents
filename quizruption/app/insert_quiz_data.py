from app.database import SessionLocal
from app.models import Quiz, Question, Answer
from app.tests.test_quiz_data import quiz_data

def insert_quizzes():
    session = SessionLocal()
    try:
        for quiz in quiz_data:
            quiz_obj = Quiz(
                title=quiz["title"],
                description=quiz["description"],
                type=quiz["type"],
                created_by=quiz["created_by"]
            )
            session.add(quiz_obj)
            session.flush()  # Get quiz_obj.id

            for question in quiz["questions"]:
                question_obj = Question(
                    quiz_id=quiz_obj.id,
                    text=question["text"]
                )
                session.add(question_obj)
                session.flush()  # Get question_obj.id

                for answer in question["answers"]:
                    answer_obj = Answer(
                        question_id=question_obj.id,
                        text=answer["text"],
                        is_correct=answer.get("is_correct", False),
                        personality_tag=answer.get("personality_tag")
                    )
                    session.add(answer_obj)
        session.commit()
        print("Quizzes inserted successfully.")
    except Exception as e:
        session.rollback()
        print("Error:", e)
    finally:
        session.close()