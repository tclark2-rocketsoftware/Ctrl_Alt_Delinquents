// Edit existing quiz/trivia content
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, updateQuiz } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quizData, setQuizData] = useState({
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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [originalCreator, setOriginalCreator] = useState(null);

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

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quiz = await getQuiz(id);
        
        // Check if user is the creator
        if (quiz.created_by !== user?.id) {
          setMessage('You can only edit quizzes that you created.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        setOriginalCreator(quiz.created_by);
        setQuizData({
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          tags: quiz.tags || [],
          questions: quiz.questions.map(q => ({
            text: q.text,
            answers: q.answers.map(a => ({
              text: a.text,
              is_correct: a.is_correct || false,
              personality_tag: a.personality_tag || ''
            }))
          }))
        });
        setLoading(false);
      } catch (error) {
        setMessage('Error loading quiz: ' + error.message);
        setLoading(false);
      }
    };

    if (user) {
      fetchQuiz();
    }
  }, [id, user, navigate]);

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
            { text: '', is_correct: false, personality_tag: '' },
            { text: '', is_correct: false, personality_tag: '' }
          ]
        }
      ]
    });
  };

  const addAnswer = (qIndex) => {
    const questions = [...quizData.questions];
    questions[qIndex].answers.push({ text: '', is_correct: false, personality_tag: '' });
    setQuizData({ ...quizData, questions });
  };

  const removeQuestion = (qIndex) => {
    if (quizData.questions.length <= 1) {
      setMessage('A quiz must have at least one question.');
      return;
    }
    
    const questions = quizData.questions.filter((_, index) => index !== qIndex);
    setQuizData({ ...quizData, questions });
  };

  const removeAnswer = (qIndex, aIndex) => {
    const questions = [...quizData.questions];
    if (questions[qIndex].answers.length <= 2) {
      setMessage('Each question must have at least two answers.');
      return;
    }
    
    questions[qIndex].answers = questions[qIndex].answers.filter((_, index) => index !== aIndex);
    setQuizData({ ...quizData, questions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateQuiz(id, quizData);
      const contentType = quizData.type === 'personality' ? 'Quiz' : 'Trivia';
      setMessage(`${contentType} updated successfully! 🎉`);
      setTimeout(() => navigate(`/quiz/${id}`), 2000);
    } catch (error) {
      const contentType = quizData.type === 'personality' ? 'quiz' : 'trivia';
      setMessage(`Error updating ${contentType}: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz data...</div>;
  }

  return (
    <div className="create-quiz">
      <div className="page-header">
        <h1>Edit Content</h1>
        <p>Update your {quizData.type === 'personality' ? 'personality quiz' : 'trivia quiz'}. Make changes and save to update the content for everyone!</p>
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

        <div className="questions-section">
          <h3>Questions</h3>
          {quizData.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-block">
              <div className="question-header">
                <div className="form-group">
                  <label>Question {qIndex + 1}</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    required
                  />
                </div>
                {quizData.questions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(qIndex)} 
                    className="btn-danger-small"
                    title="Remove Question"
                  >
                    🗑️
                  </button>
                )}
              </div>

              <div className="answers-section">
                <h4>Answers</h4>
                {question.answers.map((answer, aIndex) => (
                  <div key={aIndex} className="answer-block">
                    <div className="answer-row">
                      <input
                        type="text"
                        placeholder="Answer text"
                        value={answer.text}
                        onChange={(e) => handleAnswerChange(qIndex, aIndex, 'text', e.target.value)}
                        required
                      />
                      {question.answers.length > 2 && (
                        <button 
                          type="button" 
                          onClick={() => removeAnswer(qIndex, aIndex)} 
                          className="btn-danger-small"
                          title="Remove Answer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
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
                      <input
                        type="text"
                        placeholder="Personality tag (e.g., 'creative', 'leader', 'adventurer')"
                        value={answer.personality_tag}
                        onChange={(e) => handleAnswerChange(qIndex, aIndex, 'personality_tag', e.target.value)}
                        className="personality-tag-input"
                      />
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

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {quizData.type === 'personality' ? 'Update Personality Quiz' : 'Update Trivia Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditQuiz;