// components/__tests__/signup-T007-test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateProfile from '../../app/create-profile';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../../FirebaseConfig', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({ fetchSignInMethodsForEmail: jest.fn() }));

describe('Password Validation (T007)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('firebase/auth').fetchSignInMethodsForEmail.mockResolvedValue([]);
  });

  it('rejects passwords with less than 7 characters', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByPlaceholderText, getByText } = render(<CreateProfile />);
    
    fireEvent.changeText(getByPlaceholderText('email'), 'student@rutgers.edu');
    fireEvent.changeText(getByPlaceholderText('password'), '12345');
    fireEvent.press(getByText('Create'));
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Password length must be greater than 6 characters.');
      expect(require('expo-router').router.push).not.toHaveBeenCalled();
    });
  });

  it('accepts passwords with 6+ characters', async () => {
    const { getByPlaceholderText, getByText } = render(<CreateProfile />);
    
    fireEvent.changeText(getByPlaceholderText('email'), 'student@rutgers.edu');
    fireEvent.changeText(getByPlaceholderText('password'), 'ValidPass123!');
    fireEvent.press(getByText('Create'));

    await waitFor(() => {
      // Verify navigation occurred (assuming email is valid)
      expect(require('expo-router').router.push).toHaveBeenCalledWith({
        pathname: '/SignUpName',
        params: { 
          email: 'student@rutgers.edu',
          password: 'ValidPass123!',
          successMessage: "Account created successfully!" 
        }
      });
    });
  });
});