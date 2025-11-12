# Fetch/generate quotes, memes, jokes
from sqlalchemy.orm import Session
from app import models
import random


def get_daily_content(db: Session, personality: str):
    """Get daily content (quote, joke, GIF) for a personality type"""
    content = db.query(models.PersonalityContent).filter(
        models.PersonalityContent.personality == personality
    ).first()
    
    if content:
        return {
            "quote": content.quote,
            "gif_url": content.gif_url,
            "joke": content.joke
        }
    
    return None


def create_personality_content(
    db: Session,
    personality: str,
    quote: str = None,
    gif_url: str = None,
    joke: str = None
):
    """Create or update personality content"""
    content = db.query(models.PersonalityContent).filter(
        models.PersonalityContent.personality == personality
    ).first()
    
    if content:
        # Update existing
        if quote:
            content.quote = quote
        if gif_url:
            content.gif_url = gif_url
        if joke:
            content.joke = joke
    else:
        # Create new
        content = models.PersonalityContent(
            personality=personality,
            quote=quote,
            gif_url=gif_url,
            joke=joke
        )
        db.add(content)
    
    db.commit()
    db.refresh(content)
    return content


def seed_personality_content(db: Session):
    """Seed initial personality content"""
    sample_personalities = [
        {
            "personality": "adventurer",
            "quote": "Life is either a daring adventure or nothing at all.",
            "gif_url": "https://media.giphy.com/media/adventure/giphy.gif",
            "joke": "Why don't mountains get cold? They wear snow caps!"
        },
        {
            "personality": "thinker",
            "quote": "I think, therefore I am.",
            "gif_url": "https://media.giphy.com/media/thinking/giphy.gif",
            "joke": "Why did the philosopher bring a ladder? To reach higher thoughts!"
        },
        {
            "personality": "creative",
            "quote": "Creativity is intelligence having fun.",
            "gif_url": "https://media.giphy.com/media/creative/giphy.gif",
            "joke": "What do you call a creative artist? A master-piece worker!"
        }
    ]
    
    for p in sample_personalities:
        create_personality_content(
            db,
            personality=p["personality"],
            quote=p["quote"],
            gif_url=p["gif_url"],
            joke=p["joke"]
        )
