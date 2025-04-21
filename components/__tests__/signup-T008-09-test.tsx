// components/__tests__/signup-T008-10-test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateProfile from '../../app/create-profile';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../../FirebaseConfig', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({ fetchSignInMethodsForEmail: jest.fn() }));

describe('CreateProfile Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('firebase/auth').fetchSignInMethodsForEmail.mockResolvedValue([]);
  });

  // T008: Empty field validation
  it('shows both error messages when email and password are empty (T008)', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<CreateProfile />);
    
    fireEvent.press(getByText('Create'));
  
    await waitFor(() => {
      // Verify alert was called with both error messages
      expect(alertSpy).toHaveBeenCalledWith(
        'Missing Information',
        'Email is required\nPassword is required'
      );
      
      // Verify navigation was not called
      expect(require('expo-router').router.push).not.toHaveBeenCalled();
    });
  });

  // T009: Partial empty fields
  it('shows errors when either field is empty (T009)', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByPlaceholderText, getByText } = render(<CreateProfile />);
    
    // Test empty email
    fireEvent.changeText(getByPlaceholderText('password'), 'ValidPass123!');
    fireEvent.press(getByText('Create'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Missing Information',
        'Email is required'
      );
    });
    
    // Test empty password
    fireEvent.changeText(getByPlaceholderText('email'), 'student@rutgers.edu');
    fireEvent.changeText(getByPlaceholderText('password'), '');
    fireEvent.press(getByText('Create'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Missing Information',
        'Password is required'
      );
    });
  });
});