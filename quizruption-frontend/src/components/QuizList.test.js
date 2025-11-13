// Test for QuizList component
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuizList from '../components/QuizList';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api');

describe('QuizList Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    api.getQuizzes.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <BrowserRouter>
        <QuizList />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders quiz list when data is loaded', async () => {
    const mockQuizzes = [
      {
        id: 1,
        title: 'Test Quiz 1',
        description: 'A test quiz',
        type: 'trivia'
      },
      {
        id: 2,
        title: 'Test Quiz 2',
        description: 'Another test quiz',
        type: 'personality'
      }
    ];

    api.getQuizzes.mockResolvedValue(mockQuizzes);

    render(
      <BrowserRouter>
        <QuizList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Quiz 1')).toBeInTheDocument();
      expect(screen.getByText('Test Quiz 2')).toBeInTheDocument();
    });
  });

  test('renders error message when API call fails', async () => {
    api.getQuizzes.mockRejectedValue(new Error('Failed to load quizzes'));

    render(
      <BrowserRouter>
        <QuizList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });

  test('renders empty state when no quizzes exist', async () => {
    api.getQuizzes.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <QuizList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no quizzes|empty/i)).toBeInTheDocument();
    });
  });

  test('filters quizzes by type', async () => {
    const mockQuizzes = [
      { id: 1, title: 'Trivia Quiz', type: 'trivia' },
      { id: 2, title: 'Personality Quiz', type: 'personality' }
    ];

    api.getQuizzes.mockResolvedValue(mockQuizzes);

    render(
      <BrowserRouter>
        <QuizList filterType="trivia" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.getQuizzes).toHaveBeenCalledWith('trivia');
    });
  });
});
