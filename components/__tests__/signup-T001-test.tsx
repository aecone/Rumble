// components/__tests__/signup-T001-test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateProfile from '../../app/create-profile';

// Mock dependencies
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../../FirebaseConfig', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({ fetchSignInMethodsForEmail: jest.fn() }));

describe('Account Creation with Valid Data (T001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock that email doesn't exist in the system
    require('firebase/auth').fetchSignInMethodsForEmail.mockResolvedValue([]);
  });

  it('creates account and redirects to sign up name page with valid Rutgers email and strong password', async () => {
    const { getByPlaceholderText, getByText } = render(<CreateProfile />);
    
    // Enter valid test data
    fireEvent.changeText(
      getByPlaceholderText('email'),
      'student@scarletmail.rutgers.edu'
    );
    fireEvent.changeText(
      getByPlaceholderText('password'),
      'StrongPass123!'
    );
    
    // Press the Create button
    fireEvent.press(getByText('Create'));

    await waitFor(() => {
      // Verify navigation occurred with correct parameters
      expect(require('expo-router').router.push).toHaveBeenCalledWith({
        pathname: '/SignUpName',
        params: {
          email: 'student@scarletmail.rutgers.edu',
          password: 'StrongPass123!',
          successMessage: "Account created successfully!"
        }
      });

      // Verify no error alerts were shown
      expect(require('react-native').Alert.alert).not.toHaveBeenCalled();
    });

    // Verify email existence check was performed
    expect(require('firebase/auth').fetchSignInMethodsForEmail).toHaveBeenCalledWith(
      expect.any(Object), // auth object
      'student@scarletmail.rutgers.edu'
    );
  });
});