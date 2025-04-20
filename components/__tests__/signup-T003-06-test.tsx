// components/__tests__/create-profile.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateProfile from '../../app/create-profile';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../../FirebaseConfig', () => ({ auth: {} }));
jest.mock('firebase/auth', () => ({ fetchSignInMethodsForEmail: jest.fn() }));

describe('Email Domain Validation', () => {
  const testInvalidEmails = [
    'user@gmail.com',
    'user@rutger.edu',          // Missing 's'
    'user@rutgers.ed',          // Missing 'u'
    'user@rutgers.eduu',        // Extra 'u'
    'user@scarletmail.rutger.edu', // Missing 's'
    'user@scarletmai.rutgers.edu', // Missing 'l'
    'user@scarletmail.rutgers.ed', // Missing 'u'
    'user@scarletmail.rutgers.edue', // Extra 'e'
    'user@rutgers.com',
    'user@scarletmail.com'
  ];

  const testValidEmails = [
    'user@rutgers.edu',
    'user@scarletmail.rutgers.edu',
    'USER@RUTGERS.EDU',          // Should be case insensitive
    'user@ScarletMail.Rutgers.Edu'
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    require('firebase/auth').fetchSignInMethodsForEmail.mockResolvedValue([]);
  });

  testInvalidEmails.forEach(email => {
    it(`rejects invalid email: ${email}`, async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByPlaceholderText, getByText } = render(<CreateProfile />);

      fireEvent.changeText(getByPlaceholderText('email'), email);
      fireEvent.changeText(getByPlaceholderText('password'), 'ValidPass123!');
      fireEvent.press(getByText('Create'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Please use a valid Rutgers email address.'
        );
        expect(require('expo-router').router.push).not.toHaveBeenCalled();
      });
      expect(require('firebase/auth').fetchSignInMethodsForEmail).not.toHaveBeenCalled();
    });
  });

  testValidEmails.forEach(email => {
    it(`accepts valid email: ${email}`, async () => {
      const { getByPlaceholderText, getByText } = render(<CreateProfile />);

      fireEvent.changeText(getByPlaceholderText('email'), email);
      fireEvent.changeText(getByPlaceholderText('password'), 'ValidPass123!');
      fireEvent.press(getByText('Create'));

      await waitFor(() => {
        expect(require('expo-router').router.push).toHaveBeenCalled();
      });
    });
  });

  it('checks case insensitivity', async () => {
    const mixedCaseEmail = 'UsEr@RuTgErS.eDu';
    const { getByPlaceholderText, getByText } = render(<CreateProfile />);

    fireEvent.changeText(getByPlaceholderText('email'), mixedCaseEmail);
    fireEvent.changeText(getByPlaceholderText('password'), 'ValidPass123!');
    fireEvent.press(getByText('Create'));

    await waitFor(() => {
      expect(require('expo-router').router.push).toHaveBeenCalled();
    });
  });
});