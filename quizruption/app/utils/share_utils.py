# Generate shareable result cards
from typing import Dict
import base64
from io import BytesIO


def generate_share_card(result_data: Dict) -> Dict:
    """Generate shareable result card data"""
    share_text = f"I just completed the quiz!"
    
    if result_data.get("score") is not None:
        share_text = f"I scored {result_data['score']} on the quiz!"
    elif result_data.get("personality"):
        share_text = f"I'm a {result_data['personality']}!"
    
    share_data = {
        "text": share_text,
        "url": f"https://quizruption.app/results/{result_data['id']}",
        "hashtags": ["Quizruption", "Quiz"],
    }
    
    return share_data


def generate_share_image(result_data: Dict) -> bytes:
    """Generate a shareable image for the result (placeholder)"""
    # TODO: Implement actual image generation with PIL or similar
    # This is a placeholder function
    return b""


def get_social_share_links(result_data: Dict) -> Dict:
    """Generate social media share links"""
    share_card = generate_share_card(result_data)
    
    base_url = f"https://quizruption.app/results/{result_data['id']}"
    
    return {
        "twitter": f"https://twitter.com/intent/tweet?text={share_card['text']}&url={base_url}",
        "facebook": f"https://www.facebook.com/sharer/sharer.php?u={base_url}",
        "linkedin": f"https://www.linkedin.com/sharing/share-offsite/?url={base_url}",
        "reddit": f"https://reddit.com/submit?url={base_url}&title={share_card['text']}"
    }
