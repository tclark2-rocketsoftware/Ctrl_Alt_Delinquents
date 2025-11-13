// Test for Navbar component
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  test('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/quizruption/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  });

  test('displays user menu when authenticated', () => {
    // Mock authentication state
    const mockUser = { username: 'testuser', id: 1 };
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Check if user-specific elements are visible
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });

  test('displays login button when not authenticated', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/login|sign in/i)).toBeInTheDocument();
  });
});
