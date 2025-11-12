// Show quiz questions
import React, { useState } from 'react';

function QuizDetail({ quiz, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const answers = Object.values(selectedAnswers);
    onSubmit(answers);
  };

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-detail">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="question-container">
        <h2>Question {currentQuestion + 1} of {quiz.questions.length}</h2>
        <p className="question-text">{question.text}</p>
        
        <div className="answers">
          {question.answers.map((answer) => (
            <div
              key={answer.id}
              className={`answer-option ${selectedAnswers[question.id] === answer.id ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(question.id, answer.id)}
            >
              {answer.text}
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-controls">
        <button 
          onClick={handlePrevious} 
          disabled={currentQuestion === 0}
          className="btn-secondary"
        >
          Previous
        </button>
        
        {currentQuestion === quiz.questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
            className="btn-primary"
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            onClick={handleNext}
            disabled={!selectedAnswers[question.id]}
            className="btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizDetail;
