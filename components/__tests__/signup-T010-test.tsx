// components/__tests__/signup-T010-test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import MentorAreas from '../../app/MentorAreas';
import MenteeAreas from '../../app/MenteeAreas';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn();

describe('Successful Registration Redirect (T010)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useLocalSearchParams.mockReturnValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'student@scarletmail.rutgers.edu',
      password: 'SecurePass456!',
      birthday: '2000-01-01',
      major: 'Computer Science',
      gradYear: '2024',
      ethnicity: 'Asian',
      gender: 'Male',
      pronouns: 'He/Him',
      hobbies: 'Programming,Reading',
      career: 'Software Engineer',
      industries: 'Tech,Education',
      orgs: 'ACM,IEEE'
    });
  });

  const mockSuccessfulApiResponse = () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: () => Promise.resolve(JSON.stringify({ message: 'User created successfully' })),
    });
  };

  it('mentor registration redirects to login page with success message', async () => {
    mockSuccessfulApiResponse();
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    const { getByTestId, getByText } = render(<MentorAreas />);
    
    // Select a mentorship area using testID
    const areaButton = getByTestId('mentorship-area-Technical Skills');
    fireEvent.press(areaButton);
    
    // Press the Sign Up button
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      // Verify success alert was shown
      expect(alertSpy).toHaveBeenCalledWith(
        'Success',
        'Account created successfully!'
      );
      
      // Verify navigation to login page
      expect(router.push).toHaveBeenCalledWith('/');
    });
  });

  it('mentee registration redirects to login page with success message', async () => {
    mockSuccessfulApiResponse();
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    const { getByTestId, getByText } = render(<MenteeAreas />);
    
    // Select a mentorship area using testID
    const areaButton = getByTestId('mentorship-area-Technical Skills');
    fireEvent.press(areaButton);
    
    // Press the Sign Up button
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      // Verify success alert was shown
      expect(alertSpy).toHaveBeenCalledWith(
        'Success',
        'Account created successfully!'
      );
      
      // Verify navigation to login page
      expect(router.push).toHaveBeenCalledWith('/');
    });
  });

  it('shows error when no mentorship areas are selected', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    const { getByText } = render(<MenteeAreas />);
    
    // Press the Sign Up button without selecting any areas
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Please select at least one area of mentorship.'
      );
      expect(router.push).not.toHaveBeenCalled();
    });
  });
});