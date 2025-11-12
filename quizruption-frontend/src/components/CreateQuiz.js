// Admin quiz creation form
import React, { useState } from 'react';
import { createQuiz } from '../services/api';

function CreateQuiz() {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    type: 'trivia',
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
  const [message, setMessage] = useState('');

  const handleQuizChange = (field, value) => {
    setQuizData({ ...quizData, [field]: value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createQuiz(quizData);
      setMessage('Quiz created successfully!');
      // Reset form
      setQuizData({
        title: '',
        description: '',
        type: 'trivia',
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
      setMessage('Error creating quiz: ' + error.message);
    }
  };

  return (
    <div className="create-quiz">
      <h2>Create New Quiz</h2>
      {message && <div className="message">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quiz Title</label>
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
          <label>Quiz Type</label>
          <select
            value={quizData.type}
            onChange={(e) => handleQuizChange('type', e.target.value)}
          >
            <option value="trivia">Trivia</option>
            <option value="personality">Personality</option>
          </select>
        </div>

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
                      <label>
                        <input
                          type="checkbox"
                          checked={answer.is_correct}
                          onChange={(e) => handleAnswerChange(qIndex, aIndex, 'is_correct', e.target.checked)}
                        />
                        Correct
                      </label>
                    ) : (
                      <input
                        type="text"
                        placeholder="Personality tag"
                        value={answer.personality_tag}
                        onChange={(e) => handleAnswerChange(qIndex, aIndex, 'personality_tag', e.target.value)}
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
          <button type="button" onClick={addQuestion} className="btn-secondary">
            Add Question
          </button>
        </div>

        <button type="submit" className="btn-primary">Create Quiz</button>
      </form>
    </div>
  );
}

export default CreateQuiz;
