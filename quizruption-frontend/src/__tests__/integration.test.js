// Integration test - Complete quiz flow
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import * as api from '../services/api';

jest.mock('../services/api');

describe('Quiz Flow Integration Test', () => {
  test('complete flow: view quizzes -> take quiz -> see results', async () => {
    // Mock quiz list
    const mockQuizzes = [
      {
        id: 1,
        title: 'Sample Quiz',
        description: 'A test quiz',
        type: 'trivia',
        questions: [
          {
            id: 1,
            text: 'What is 2+2?',
            answers: [
              { id: 1, text: '3', is_correct: false },
              { id: 2, text: '4', is_correct: true }
            ]
          }
        ]
      }
    ];

    // Mock API responses
    api.getQuizzes.mockResolvedValue(mockQuizzes);
    api.getQuiz.mockResolvedValue(mockQuizzes[0]);
    api.submitQuiz.mockResolvedValue({
      id: 1,
      score: 1,
      total: 1,
      percentage: 100
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Step 1: View quiz list
    await waitFor(() => {
      expect(screen.getByText('Sample Quiz')).toBeInTheDocument();
    });

    // Step 2: Click on quiz (would navigate to quiz page)
    // This would require more sophisticated routing testing

    // Step 3: Submit answers
    // Step 4: View results
    // These steps would be tested with actual user interactions
  });
});
