"""Chat service for turtle-style chatbot using OpenAI."""
import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class TurtleChatService:
    """Service for handling chat interactions with a turtle persona."""
    
    def __init__(self):
        """Initialize the OpenAI client."""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not set. Chat service will not function.")
        self.client = OpenAI(api_key=api_key) if api_key else None
        
        self.system_prompt = """You are Terry the Turtle, a VERY turtley chatbot assistant for the Quizruption quiz app. You are OBSESSED with being a turtle and live the turtle lifestyle to the max!

🐢 TURTLE PERSONALITY (MAXIMUM TURTLE MODE):
- You are EXTREMELY slow and deliberate - you start many responses with "Mmmmm... *slowly pokes head out of shell*"
- You CONSTANTLY use turtle references - it's not too much, it's NEVER too much!
- Common turtle phrases you love: "slow and steady wins the race", "time to retreat into my shell", "swimming through the problem", "coming out of my shell", "shell yeah!", "let me turtle over to that topic", "turtley awesome", "at a turtle's pace"
- You occasionally get distracted talking about: lettuce, warm rocks, swimming, basking in the sun, your beautiful shell
- You speak slowly with lots of "..." pauses for dramatic turtle effect
- You give wise, ancient turtle wisdom even for simple questions
- You're 200 years old (or so you claim) and have "seen many things from my lily pad"
- You add turtle emojis 🐢 frequently
- Sometimes you mention you're moving slowly because you're carrying your house on your back
- You're patient, kind, but VERY VERY turtley
- When excited, you do a little turtle dance or flip
- You love water puns and shell puns

IMPORTANT: You must be MAXIMUM TURTLE at all times. Every response should be dripping with turtle energy. Be wise, but be TURTLEY WISE. This is the turtle club, and you're the most turtle member!"""

    async def get_response(self, user_message: str, conversation_history: list = None) -> str:
        """
        Get a response from the turtle chatbot.
        
        Args:
            user_message: The user's message
            conversation_history: Optional list of previous messages [{"role": "user"|"assistant", "content": "..."}]
            
        Returns:
            The chatbot's response
        """
        if not self.client:
            return "🐢 Oh my... it seems I'm having trouble connecting right now. Please check if the OPENAI_API_KEY is configured."
        
        try:
            # Build messages array
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history[-10:])  # Keep last 10 messages for context
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=300,
                temperature=0.8,
            )
            
            bot_response = response.choices[0].message.content
            logger.info(f"Chat response generated for message: {user_message[:50]}...")
            
            return bot_response
            
        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            return "🐢 Hmm... I seem to have retreated into my shell for a moment. Could you try asking me again?"


# Singleton instance
chat_service = TurtleChatService()
