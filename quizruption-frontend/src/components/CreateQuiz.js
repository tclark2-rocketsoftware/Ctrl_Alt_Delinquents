// Content creation form (Quizzes and Trivia)
import React, { useState } from 'react';
import { createQuiz } from '../services/api';

function CreateQuiz() {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    type: 'personality',
    tags: [], // Add tags array
    personalities: [], // New: Multiple personality outcomes
    questions: [
      {
        text: '',
        answers: [
          { text: '', is_correct: false, personality_weights: {} },
          { text: '', is_correct: false, personality_weights: {} }
        ]
      }
    ]
  });
  const [message, setMessage] = useState('');

  // Available tags for quiz categorization
  const availableTags = [
    { id: 'personality', label: 'Personality', emoji: '🌟', color: '#cc95af' },
    { id: 'fun', label: 'Fun', emoji: '🎉', color: '#ba99dc' },
    { id: 'educational', label: 'Educational', emoji: '📚', color: '#667eea' },
    { id: 'creative', label: 'Creative', emoji: '🎨', color: '#f093fb' },
    { id: 'lifestyle', label: 'Lifestyle', emoji: '🌱', color: '#4facfe' },
    { id: 'career', label: 'Career', emoji: '💼', color: '#43e97b' },
    { id: 'other', label: 'Other', emoji: '🎲', color: '#ff6b6b' }
  ];

  // Available tags for trivia categorization
  const triviaTags = [
    { id: 'science', label: 'Science', emoji: '🔬', color: '#4facfe' },
    { id: 'history', label: 'History', emoji: '🏛️', color: '#43e97b' },
    { id: 'geography', label: 'Geography', emoji: '🌍', color: '#667eea' },
    { id: 'sports', label: 'Sports', emoji: '⚽', color: '#ff6b6b' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#f093fb' },
    { id: 'literature', label: 'Literature', emoji: '📚', color: '#54a0ff' },
    { id: 'general', label: 'General Knowledge', emoji: '🧠', color: '#5f27cd' },
    { id: 'other', label: 'Other', emoji: '🎲', color: '#ff7675' }
  ];

  const handleQuizChange = (field, value) => {
    if (field === 'type') {
      // Clear tags when switching quiz type
      setQuizData({ ...quizData, [field]: value, tags: [] });
    } else {
      setQuizData({ ...quizData, [field]: value });
    }
  };

  const toggleTag = (tagId) => {
    const tags = quizData.tags.includes(tagId) 
      ? quizData.tags.filter(id => id !== tagId)
      : [...quizData.tags, tagId];
    setQuizData({ ...quizData, tags });
  };

  // Personality management functions
  const addPersonality = () => {
    if (quizData.personalities.length >= 8) {
      setMessage('Maximum of 8 personality outcomes allowed.');
      return;
    }
    
    const newPersonality = {
      id: `personality_${Date.now()}`,
      name: '',
      description: '',
      emoji: '🌟',
      image_url: ''
    };
    
    setQuizData({
      ...quizData,
      personalities: [...quizData.personalities, newPersonality]
    });
  };

  const updatePersonality = (index, field, value) => {
    const personalities = [...quizData.personalities];
    personalities[index][field] = value;
    setQuizData({ ...quizData, personalities });
  };

  const removePersonality = (index) => {
    const personalities = quizData.personalities.filter((_, i) => i !== index);
    
    // Clean up weights in all answers
    const questions = quizData.questions.map(question => ({
      ...question,
      answers: question.answers.map(answer => {
        const newWeights = { ...answer.personality_weights };
        delete newWeights[quizData.personalities[index].id];
        return { ...answer, personality_weights: newWeights };
      })
    }));
    
    setQuizData({ 
      ...quizData, 
      personalities,
      questions
    });
  };

  // Handle personality image upload
  const handlePersonalityImageUpload = async (personalityIndex, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be less than 5MB.');
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage('Authentication required for image upload.');
        return;
      }

      // Upload image
      const response = await fetch(`http://localhost:8000/api/upload/personality-image?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Update personality with new image URL
      updatePersonality(personalityIndex, 'image_url', data.image_url);
      setMessage('Image uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading personality image:', error);
      setMessage('Error uploading image. Please try again.');
    }
  };

  const handleQuestionChange = (qIndex, value) => {
    const questions = [...quizData.questions];
    questions[qIndex].text = value;
    setQuizData({ ...quizData, questions });
  };

  const handleAnswerChange = (qIndex, aIndex, field, value) => {
    const questions = [...quizData.questions];
    questions[qIndex].answers[aIndex][field] = value;
    setQuizData({ ...quizData, questions });
  };

  // Handle personality weight changes
  const handleWeightChange = (qIndex, aIndex, personalityId, weight) => {
    const questions = [...quizData.questions];
    if (!questions[qIndex].answers[aIndex].personality_weights) {
      questions[qIndex].answers[aIndex].personality_weights = {};
    }
    questions[qIndex].answers[aIndex].personality_weights[personalityId] = parseInt(weight) || 0;
    setQuizData({ ...quizData, questions });
  };

  const addQuestion = () => {
    if (quizData.questions.length >= 20) {
      const contentType = quizData.type === 'personality' ? 'quiz' : 'trivia';
      setMessage(`Maximum of 20 questions allowed per ${contentType}.`);
      return;
    }
    
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          text: '',
          answers: [
            { text: '', is_correct: false, personality_weights: {} },
            { text: '', is_correct: false, personality_weights: {} }
          ]
        }
      ]
    });
  };

  const addAnswer = (qIndex) => {
    const questions = [...quizData.questions];
    questions[qIndex].answers.push({ 
      text: '', 
      is_correct: false, 
      personality_weights: {} 
    });
    setQuizData({ ...quizData, questions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createQuiz(quizData);
      const contentType = quizData.type === 'personality' ? 'Quiz' : 'Trivia';
      setMessage(`${contentType} created successfully! 🎉`);
      // Reset form
      setQuizData({
        title: '',
        description: '',
        type: 'personality',
        tags: [],
        questions: [
          {
            text: '',
            answers: [
              { text: '', is_correct: false, personality_tag: '' },
              { text: '', is_correct: false, personality_tag: '' }
            ]
          }
        ]
      });
    } catch (error) {
      const contentType = quizData.type === 'personality' ? 'quiz' : 'trivia';
      setMessage(`Error creating ${contentType}: ${error.message}`);
    }
  };

  return (
    <div className="create-quiz">
      <div className="page-header">
        <h1>Create New Content</h1>
        <p>Create either a fun BuzzFeed-style personality quiz or a traditional knowledge-testing trivia quiz!</p>
      </div>
      {message && <div className="message">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Content Type</label>
          <select
            value={quizData.type}
            onChange={(e) => handleQuizChange('type', e.target.value)}
            className="type-selector"
          >
            <option value="personality">🌟 Personality Quiz (BuzzFeed Style)</option>
            <option value="trivia">🧠 Trivia Quiz (Knowledge Test)</option>
          </select>
        </div>

        <div className="form-group">
          <label>{quizData.type === 'personality' ? 'Quiz Title' : 'Trivia Title'}</label>
          <input
            type="text"
            value={quizData.title}
            onChange={(e) => handleQuizChange('title', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={quizData.description}
            onChange={(e) => handleQuizChange('description', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{quizData.type === 'personality' ? 'Quiz Tags' : 'Trivia Categories'}</label>
          <div className="tags-section">
            <p className="tags-help">
              {quizData.type === 'personality' 
                ? 'Select one or more tags to help users find your personality quiz:' 
                : 'Select one or more categories for your trivia quiz:'}
            </p>
            <div className="tag-container">
              {(quizData.type === 'personality' ? availableTags : triviaTags).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-btn ${quizData.tags.includes(tag.id) ? 'tag-active' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    '--tag-color': tag.color,
                    '--tag-color-light': tag.color + '30'
                  }}
                >
                  <span className="tag-emoji">{tag.emoji}</span>
                  <span className="tag-label">{tag.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {quizData.type === 'personality' && (
          <div className="personalities-section">
            <div className="section-header">
              <h3>Personality Outcomes</h3>
              <p className="help-text">Define the possible personalities users can get. You need at least 2 outcomes.</p>
            </div>
            
            {quizData.personalities.map((personality, index) => (
              <div key={personality.id} className="personality-block">
                <div className="personality-header">
                  <h4>Outcome {index + 1}</h4>
                  <button 
                    type="button" 
                    onClick={() => removePersonality(index)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="personality-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Emoji</label>
                      <input
                        type="text"
                        maxLength="2"
                        value={personality.emoji}
                        onChange={(e) => updatePersonality(index, 'emoji', e.target.value)}
                        placeholder="🌟"
                        className="emoji-input"
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Personality Name</label>
                      <input
                        type="text"
                        value={personality.name}
                        onChange={(e) => updatePersonality(index, 'name', e.target.value)}
                        placeholder="e.g., The Creative Visionary, The Logical Thinker"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={personality.description}
                      onChange={(e) => updatePersonality(index, 'description', e.target.value)}
                      placeholder="Describe this personality type and what it means..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Personality Image</label>
                    <div className="image-upload-section">
                      {personality.image_url ? (
                        <div className="personality-image-preview">
                          <img 
                            src={personality.image_url.startsWith('http') 
                              ? personality.image_url 
                              : `http://localhost:8000${personality.image_url}`
                            } 
                            alt={personality.name || 'Personality'} 
                            className="personality-preview-img"
                          />
                          <button
                            type="button"
                            onClick={() => updatePersonality(index, 'image_url', '')}
                            className="btn-remove-image"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      ) : (
                        <div className="image-upload-placeholder">
                          <label htmlFor={`personality-image-${personality.id}`} className="upload-btn">
                            📸 Upload Image
                          </label>
                          <input
                            id={`personality-image-${personality.id}`}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={(e) => handlePersonalityImageUpload(index, e)}
                            style={{ display: 'none' }}
                          />
                          <p className="upload-hint">Add an image that represents this personality (optional)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addPersonality}
              className={quizData.personalities.length >= 8 ? "btn-disabled" : "btn-secondary"}
              disabled={quizData.personalities.length >= 8}
            >
              {quizData.personalities.length >= 8 ? "Maximum Outcomes Reached (8/8)" : `Add Personality Outcome (${quizData.personalities.length}/8)`}
            </button>
          </div>
        )}

        <div className="questions-section">
          <h3>Questions</h3>
          {quizData.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-block">
              <div className="form-group">
                <label>Question {qIndex + 1}</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  required
                />
              </div>

              <div className="answers-section">
                <h4>Answers</h4>
                {question.answers.map((answer, aIndex) => (
                  <div key={aIndex} className="answer-block">
                    <input
                      type="text"
                      placeholder="Answer text"
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(qIndex, aIndex, 'text', e.target.value)}
                      required
                    />
                    
                    {quizData.type === 'trivia' ? (
                      <label className="correct-answer-label">
                        <input
                          type="checkbox"
                          checked={answer.is_correct}
                          onChange={(e) => handleAnswerChange(qIndex, aIndex, 'is_correct', e.target.checked)}
                        />
                        <span className="checkmark">Correct Answer</span>
                      </label>
                    ) : (
                      <div className="personality-weights">
                        <label className="weights-label">Personality Points:</label>
                        {quizData.personalities.length === 0 ? (
                          <p className="no-personalities-message">
                            ⚠️ Add personality outcomes above to set up scoring
                          </p>
                        ) : (
                          <div className="weight-inputs">
                            {quizData.personalities.map((personality) => (
                              <div key={personality.id} className="weight-input-group">
                                <span className="personality-label">
                                  {personality.emoji} {personality.name || `Outcome ${quizData.personalities.indexOf(personality) + 1}`}:
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max="5"
                                  value={answer.personality_weights[personality.id] || 0}
                                  onChange={(e) => handleWeightChange(qIndex, aIndex, personality.id, e.target.value)}
                                  className="weight-input"
                                  placeholder="0"
                                />
                                <span className="weight-help">pts</span>
                              </div>
                            ))}
                            <div className="weight-help-text">
                              <small>0 = No influence, 1-5 = Points toward this personality</small>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addAnswer(qIndex)} className="btn-secondary">
                  Add Answer
                </button>
              </div>
            </div>
          ))}
          <button 
            type="button" 
            onClick={addQuestion} 
            className={quizData.questions.length >= 20 ? "btn-disabled" : "btn-secondary"}
            disabled={quizData.questions.length >= 20}
          >
            {quizData.questions.length >= 20 ? "Maximum Questions Reached (20/20)" : `Add Question (${quizData.questions.length}/20)`}
          </button>
        </div>

        <button type="submit" className="btn-primary">
          {quizData.type === 'personality' ? 'Create Personality Quiz' : 'Create Trivia Quiz'}
        </button>
      </form>
    </div>
  );
}

export default CreateQuiz;
