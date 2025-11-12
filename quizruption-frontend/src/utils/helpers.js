// Helper functions

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (score, total) => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Shuffle array (for randomizing quiz questions/answers)
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Validate quiz data before submission
 */
export const validateQuizData = (quizData) => {
  if (!quizData.title || quizData.title.trim() === '') {
    return { valid: false, error: 'Quiz title is required' };
  }
  
  if (!quizData.questions || quizData.questions.length === 0) {
    return { valid: false, error: 'At least one question is required' };
  }
  
  for (let i = 0; i < quizData.questions.length; i++) {
    const question = quizData.questions[i];
    
    if (!question.text || question.text.trim() === '') {
      return { valid: false, error: `Question ${i + 1} text is required` };
    }
    
    if (!question.answers || question.answers.length < 2) {
      return { valid: false, error: `Question ${i + 1} must have at least 2 answers` };
    }
    
    if (quizData.type === 'trivia') {
      const hasCorrect = question.answers.some(a => a.is_correct);
      if (!hasCorrect) {
        return { valid: false, error: `Question ${i + 1} must have at least one correct answer` };
      }
    }
  }
  
  return { valid: true };
};

/**
 * Get quiz type badge color
 */
export const getQuizTypeBadgeColor = (type) => {
  return type === 'trivia' ? '#3498db' : '#9b59b6';
};

/**
 * Format time remaining
 */
export const formatTimeRemaining = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
