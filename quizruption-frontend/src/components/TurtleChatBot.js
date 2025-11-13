import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

const TurtleChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🐢 Mmmmm... *slowly pokes head out of shell* \n\nHello there, friend! I\'m Terry the Turtle, and I\'m TURTLEY excited to meet you! Shell yeah! 🐢\n\nI\'ve been basking on this warm rock for 200 years, and now I\'m here to help you with Quizruption at a nice, slow turtle\'s pace... What can this old shell do for you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history (exclude timestamps for API)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send to API
      const response = await sendChatMessage(userMessage.content, conversationHistory);

      // Add bot response
      const botMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage = {
        role: 'assistant',
        content: '🐢 *retreats rapidly into shell* \n\nOhhh my... I seem to have gotten tangled in some seaweed there. At my age (200 years young!), these things happen... Could you try that again? This old turtle needs a moment to crawl back out... 🐢💚',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Floating Turtle Icon */}
      <div 
        className={`turtle-chat-icon ${isOpen ? 'chat-open' : ''}`}
        onClick={handleToggleChat}
        title="Chat with Terry the Turtle - 100% Turtley Guaranteed! 🐢"
      >
        <span className="turtle-emoji">🐢</span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="turtle-chat-window">
          <div className="turtle-chat-header">
            <div className="turtle-chat-header-content">
              <span className="turtle-avatar">🐢</span>
              <div>
                <h3>🐢 Terry the Turtle 🐢</h3>
                <p className="turtle-status">Slow, steady & TURTLEY! 200 years young! 💚</p>
              </div>
            </div>
            <button 
              className="turtle-chat-close"
              onClick={handleToggleChat}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="turtle-chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`turtle-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {msg.role === 'assistant' && (
                  <span className="message-avatar">🐢</span>
                )}
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <span className="message-avatar user-avatar">👤</span>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="turtle-message bot-message">
                <span className="message-avatar">🐢</span>
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className="turtle-chat-input-container" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="turtle-chat-input"
              placeholder="Ask this wise old turtle anything... 🐢💭"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="turtle-chat-send"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
            >
              📨
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default TurtleChatBot;
