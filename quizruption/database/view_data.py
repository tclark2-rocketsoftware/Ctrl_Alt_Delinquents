"""
Script to view all data in the Quizruption database
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.models import User, Quiz, Question, Answer, Result, JokeSuggestion

# Database connection
SQLALCHEMY_DATABASE_URL = "sqlite:///./quizruption.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def print_separator(title=""):
    """Print a visual separator"""
    print("\n" + "="*80)
    if title:
        print(f"  {title}")
        print("="*80)

def view_users(db):
    """View all users"""
    print_separator("USERS")
    users = db.query(User).all()
    
    if not users:
        print("No users found.")
        return
    
    for user in users:
        print(f"\nID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Display Name: {user.display_name or 'N/A'}")
        print(f"Bio: {user.bio or 'N/A'}")
        print(f"Location: {user.location or 'N/A'}")
        print(f"Website: {user.website or 'N/A'}")
        print(f"Created: {user.created_at}")
        print(f"Quizzes Created: {len(user.quizzes)}")
        print(f"Results Saved: {len(user.results)}")
        print(f"Joke Suggestions: {len(user.joke_suggestions)}")
        print("-" * 80)

def view_quizzes(db):
    """View all quizzes"""
    print_separator("QUIZZES")
    quizzes = db.query(Quiz).all()
    
    if not quizzes:
        print("No quizzes found.")
        return
    
    for quiz in quizzes:
        print(f"\nID: {quiz.id}")
        print(f"Title: {quiz.title}")
        print(f"Type: {quiz.type}")
        print(f"Description: {quiz.description or 'N/A'}")
        print(f"Created By: User #{quiz.created_by} ({quiz.creator.username if quiz.creator else 'Unknown'})")
        print(f"Created: {quiz.created_at}")
        print(f"Questions: {len(quiz.questions)}")
        print(f"Results: {len(quiz.results)}")
        print("-" * 80)

def view_questions(db):
    """View all questions"""
    print_separator("QUESTIONS")
    questions = db.query(Question).all()
    
    if not questions:
        print("No questions found.")
        return
    
    for question in questions:
        print(f"\nID: {question.id}")
        print(f"Quiz: {question.quiz.title} (ID: {question.quiz_id})")
        print(f"Text: {question.text}")
        print(f"Answers: {len(question.answers)}")
        
        # Show answers
        for i, answer in enumerate(question.answers, 1):
            correct = "✓ CORRECT" if answer.is_correct else ""
            print(f"  {i}. {answer.text} {correct}")
        print("-" * 80)

def view_results(db):
    """View all results"""
    print_separator("RESULTS")
    results = db.query(Result).all()
    
    if not results:
        print("No results found.")
        return
    
    for result in results:
        print(f"\nID: {result.id}")
        print(f"User: {result.user.username if result.user else 'Anonymous'} (ID: {result.user_id})")
        print(f"Quiz: {result.quiz.title} (ID: {result.quiz_id})")
        print(f"Score: {result.score}")
        print(f"Personality: {result.personality if hasattr(result, 'personality') else 'N/A'}")
        print(f"Created: {result.created_at}")
        print("-" * 80)

def view_joke_suggestions(db):
    """View all joke suggestions"""
    print_separator("JOKE SUGGESTIONS")
    jokes = db.query(JokeSuggestion).all()
    
    if not jokes:
        print("No joke suggestions found.")
        return
    
    for joke in jokes:
        print(f"\nID: {joke.id}")
        print(f"User: {joke.user.username if joke.user else 'Unknown'} (ID: {joke.user_id})")
        print(f"Suggestion: {joke.suggestion_text}")
        print(f"Used: {'Yes' if joke.used else 'No'}")
        print(f"Created: {joke.created_at}")
        print("-" * 80)

def view_database_stats(db):
    """View database statistics"""
    print_separator("DATABASE STATISTICS")
    
    stats = {
        "Users": db.query(User).count(),
        "Quizzes": db.query(Quiz).count(),
        "Questions": db.query(Question).count(),
        "Answers": db.query(Answer).count(),
        "Results": db.query(Result).count(),
        "Joke Suggestions": db.query(JokeSuggestion).count()
    }
    
    print("\nTotal Records:")
    for table, count in stats.items():
        print(f"  {table}: {count}")
    
    # Quiz type breakdown
    print("\nQuiz Types:")
    trivia_count = db.query(Quiz).filter(Quiz.type == 'trivia').count()
    personality_count = db.query(Quiz).filter(Quiz.type == 'personality').count()
    print(f"  Trivia: {trivia_count}")
    print(f"  Personality: {personality_count}")

def main():
    """Main function to display all database data"""
    print("\n" + "="*80)
    print("  QUIZRUPTION DATABASE VIEWER")
    print("="*80)
    
    db = SessionLocal()
    
    try:
        # Show statistics first
        view_database_stats(db)
        
        # Show all data
        view_users(db)
        view_quizzes(db)
        view_questions(db)
        view_results(db)
        view_joke_suggestions(db)
        
        print("\n" + "="*80)
        print("  END OF DATABASE DUMP")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
