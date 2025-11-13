from datetime import date as date_cls
import os
import httpx
import random
import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger(__name__)

PROMPT = (
    "Generate a light-hearted, two-sentence joke. Vary topics across technology, computer science, general life, or wholesome humor. "
    "Avoid offensive, adult, hateful, or sensitive content. Return ONLY the joke."
)

PROMPT_WITH_SUGGESTIONS = (
    "Generate a hilarious, relatable two-sentence joke about programming, software development, or tech life. "
    "User suggestions for themes: {suggestions}. "
    "Make it punchy and funny - something developers would laugh at. Keep it clean and professional. Return ONLY the joke."
)


def _today() -> str:
    return date_cls.today().isoformat()


def _fallback_joke() -> str:
    subjects = [
        'A programmer', 'An anxious server', 'A cloud engineer', 'A debugging session', 'A junior dev',
        'A rogue semicolon', 'A sleepy laptop', 'An optimistic AI', 'A cautious database', 'A persistent memory leak'
    ]
    actions = [
        'walks into a coffee shop', 'tries to relax during deployment', 'questions its existence', 'refuses to compile',
        'asks for just one more sprint', 'pretends everything is scalable', 'hides behind feature flags',
        'ships to production on Friday', 'switches environments mid-sentence', 'migrates without a backup'
    ]
    twists = [
        'and orders a latte with extra RAM.', 'and realizes the bug was a missing comma all along.',
        'then proudly says: "It worked on my machine."', 'but staging quietly judges in the corner.',
        'and the logs start flirting back.', 'and the API responds with a gentle 418.',
        'then discovers the fix was turning it off and on.', 'and the unit tests cheer politely.',
        'while the CI pipeline takes a dramatic pause.', 'and a rubber duck nods in deep understanding.'
    ]
    second_lines = [
        'Somewhere, a project manager schedules a retro to celebrate.', 'Meanwhile, the legacy system pretends not to notice.',
        'In the distance, a rogue cron job awakens.', 'Naturally, the documentation remains blissfully outdated.',
        'The backlog quietly grows three new mysterious tickets.', 'A senior dev whispers: "Ship it."',
        'Technical debt sends a friendly reminder postcard.', 'Version control writes another chapter of history.',
        'An AI assistant drafts a haiku about latency.', 'The error logs compose a minimalist opera.'
    ]
    import random
    pick = lambda arr: arr[random.randint(0, len(arr) - 1)]
    return f"{pick(subjects)} {pick(actions)} {pick(twists)} {pick(second_lines)}"


def _fetch_openai_joke(api_key: str) -> str | None:
    if not api_key:
        return None
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    payload = {
        'model': 'gpt-4o-mini',
        'messages': [
            {'role': 'system', 'content': 'You are a creative, family-friendly joke generator.'},
            {'role': 'user', 'content': PROMPT}
        ],
        'temperature': 0.9,
        'max_tokens': 80
    }
    try:
        with httpx.Client(timeout=15) as client:
            resp = client.post('https://api.openai.com/v1/chat/completions', json=payload, headers=headers)
        if resp.status_code != 200:
            logger.warning(f"OpenAI request failed: status={resp.status_code}, body={resp.text[:300]}")
            return None
        data = resp.json()
        joke = (data.get('choices') or [{}])[0].get('message', {}).get('content', '').strip()
        if not joke or joke.count('.') + joke.count('!') < 1:  # basic sentence check
            logger.info("OpenAI response did not contain a valid two-sentence joke; falling back.")
            return None
        logger.info("OpenAI joke generated successfully.")
        return joke
    except Exception as e:
        logger.exception(f"Exception while requesting OpenAI joke: {e}")
        return None


def _fetch_openai_joke_with_suggestions(api_key: str, suggestions: list[str]) -> str | None:
    if not api_key or not suggestions:
        return _fetch_openai_joke(api_key)
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    suggestion_text = ', '.join(suggestions[:5])  # Use up to 5 suggestions
    prompt = PROMPT_WITH_SUGGESTIONS.format(suggestions=suggestion_text)
    
    payload = {
        'model': 'gpt-4o-mini',
        'messages': [
            {'role': 'system', 'content': 'You are a creative, family-friendly joke generator.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.9,
        'max_tokens': 80
    }
    try:
        with httpx.Client(timeout=15) as client:
            resp = client.post('https://api.openai.com/v1/chat/completions', json=payload, headers=headers)
        if resp.status_code != 200:
            logger.warning(f"OpenAI (with suggestions) failed: status={resp.status_code}, body={resp.text[:300]}")
            return None
        data = resp.json()
        joke = (data.get('choices') or [{}])[0].get('message', {}).get('content', '').strip()
        if not joke or joke.count('.') + joke.count('!') < 1:
            logger.info("OpenAI (with suggestions) did not return a valid joke; falling back.")
            return None
        logger.info("OpenAI joke (with suggestions) generated successfully.")
        return joke
    except Exception as e:
        logger.exception(f"Exception while requesting OpenAI joke with suggestions: {e}")
        return None


def get_daily_joke(db: Session) -> dict:
    today = _today()
    existing = db.query(models.DailyJoke).filter(models.DailyJoke.date == today).first()
    if existing:
        return {
            'date': existing.date,
            'joke': existing.joke,
            'source': existing.source,
            'cached': True
        }

    # Try to get unused suggestions from DB
    unused_suggestions = db.query(models.JokeSuggestion).filter(
        models.JokeSuggestion.used == False
    ).limit(5).all()
    
    suggestion_texts = [s.suggestion_text for s in unused_suggestions]
    
    # Try OpenAI with or without suggestions
    api_key = os.getenv('OPENAI_API_KEY') or os.getenv('OPENAI_KEY')
    joke = None
    logger.info(f"get_daily_joke: api_key_present={bool(api_key)} suggestions_count={len(suggestion_texts)}")
    
    if api_key and suggestion_texts:
        joke = _fetch_openai_joke_with_suggestions(api_key, suggestion_texts)
        if joke:
            # Mark suggestions as used
            for suggestion in unused_suggestions:
                suggestion.used = True
            db.commit()
    elif api_key:
        joke = _fetch_openai_joke(api_key)
    
    if not joke:
        logger.info("Falling back to local joke generator.")
        joke = _fallback_joke()
    
    source = 'openai' if api_key and joke != _fallback_joke() else 'fallback'
    logger.info(f"Daily joke source: {source}; suggestions_used={bool(suggestion_texts)}")

    record = models.DailyJoke(date=today, joke=joke, source=source)
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        'date': record.date,
        'joke': record.joke,
        'source': record.source,
        'cached': False
    }
