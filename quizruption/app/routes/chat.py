"""Chat routes for turtle chatbot."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
from app.services.chat_service import chat_service

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    """Schema for a chat message."""
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Schema for chat request."""
    message: str = Field(..., description="User's message to the chatbot")
    conversation_history: Optional[List[ChatMessage]] = Field(default=None, description="Previous conversation messages")


class ChatResponse(BaseModel):
    """Schema for chat response."""
    response: str = Field(..., description="Chatbot's response")
    success: bool = Field(default=True, description="Whether the request was successful")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to Terry the Turtle chatbot.
    
    - **message**: The user's message
    - **conversation_history**: Optional list of previous messages for context
    """
    try:
        # Convert Pydantic models to dicts for the service
        history = None
        if request.conversation_history:
            history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
        
        # Get response from chat service
        response_text = await chat_service.get_response(request.message, history)
        
        return ChatResponse(response=response_text, success=True)
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate chat response")
