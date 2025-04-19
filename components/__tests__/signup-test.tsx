import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreateProfile from '../../app/create-profile';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

describe('CreateProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error for duplicate email', async () => {
    // Mock fetchSignInMethodsForEmail to return a method, indicating email exists
    (fetchSignInMethodsForEmail as jest.Mock).mockResolvedValue(['password']);
    
    // Spy on alert function
    jest.spyOn(Alert, 'alert');
    
    const { getByPlaceholderText, getByText } = render(<CreateProfile />);
    
    // Enter a valid Rutgers email
    fireEvent.changeText(
      getByPlaceholderText('email'),
      'student@scarletmail.rutgers.edu'
    );
    
    // Enter a valid password
    fireEvent.changeText(
      getByPlaceholderText('password'),
      'password123'
    );
    
    // Click the Create button
    fireEvent.press(getByText('Create'));

    // Wait for the alert to be called
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "This email is already registered. Please sign in or use a different email."
      );
    });
  });
});