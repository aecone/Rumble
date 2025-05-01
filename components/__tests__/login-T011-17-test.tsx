import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import Index from '../../app/index';

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
}));

// Mock expo-router
const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    replace: mockRouterReplace,
    push: mockRouterPush,
  },
}));

// Mock Firebase auth
const mockSignInWithEmailAndPassword = jest.fn();

// IMPORTANT: Mock FirebaseConfig as it's imported in the component
jest.mock('../../app/../FirebaseConfig', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: jest.fn(),
}));

// Mock React Native components and Alert
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    SafeAreaView: jest.fn(({ children, ...props }) => (
      <rn.View {...props}>{children}</rn.View>
    )),
    Text: jest.fn(({ children, ...props }) => (
      <rn.Text {...props}>{children}</rn.Text>
    )),
    TextInput: jest.fn(({ placeholder, value, onChangeText, ...props }) => (
      <rn.TextInput
        {...props}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    )),
    TouchableOpacity: jest.fn(({ children, onPress, ...props }) => (
      <rn.TouchableOpacity {...props} onPress={onPress}>
        {children}
      </rn.TouchableOpacity>
    )),
    Alert: {
      alert: jest.fn(),
    },
  };
});

describe('Main Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('T011: Verify app opens to main page', () => {
    beforeEach(() => {
      render(<Index />);
    });

    it('displays the sign-in title', () => {
      expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('displays the subtitle text', () => {
      expect(screen.getByText('Please sign in to continue.')).toBeTruthy();
    });

    it('shows email input field', () => {
      expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    });

    it('shows password input field', () => {
      expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    });

    it('displays sign in button', () => {
      expect(screen.getByText('Log In')).toBeTruthy();
    });

    it('shows sign up option', () => {
      expect(
        screen.getByText("Don't have an account? Sign up")
      ).toBeTruthy();
    });
  });

  describe('T012: Main page renders properly across screen sizes', () => {
    it('renders correctly on different screen sizes', () => {
      // Test with default size
      const { rerender } = render(<Index />);
      expect(screen.getByText('Sign In')).toBeTruthy();

      // Mock different screen sizes if needed
      // You might need to use a library like react-native-testing-library's
      // screen.resizeTo or similar approach to test responsive layouts
    });
  });

  describe('T013: Verify user can log in with correct credentials', () => {
    it('redirects to profile tab on successful login', async () => {
      // Mock successful auth response
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({ 
        user: { uid: 'test-uid' } 
      });

      render(<Index />);

      // Fill in form
      fireEvent.changeText(screen.getByPlaceholderText('Email'), 'student@rutgers.edu');
      fireEvent.changeText(screen.getByPlaceholderText('Password'), 'CorrectPass123!');
      
      // Submit form
      fireEvent.press(screen.getByText('Log In'));
      
      // Wait for the async operation to complete
      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
        expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/profileTab');
      });
    });
  });

  describe('T014: Login fails when email is not registered', () => {
    it('shows error message for invalid email', async () => {
      // Mock failed auth response
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('auth/user-not-found'));
      
      render(<Index />);
      
      fireEvent.changeText(screen.getByPlaceholderText('Email'), 'wrong@rutgers.edu');
      fireEvent.changeText(screen.getByPlaceholderText('Password'), 'CorrectPass123!');
      fireEvent.press(screen.getByText('Log In'));

      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith(expect.stringContaining('Sign in failed'));
      });
    });
  });

  describe('T015: Login fails with incorrect password', () => {
    it('shows error message for incorrect password', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('auth/wrong-password'));
      
      render(<Index />);
      
      fireEvent.changeText(screen.getByPlaceholderText('Email'), 'student@rutgers.edu');
      fireEvent.changeText(screen.getByPlaceholderText('Password'), 'WrongPass456!');
      fireEvent.press(screen.getByText('Log In'));

      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith(expect.stringContaining('Sign in failed'));
      });
    });
  });

  describe('T016: Form validation catches missing email', () => {
    it('shows error when email is blank', async () => {
      render(<Index />);
      
      fireEvent.changeText(screen.getByPlaceholderText('Email'), '');
      fireEvent.changeText(screen.getByPlaceholderText('Password'), 'CorrectPass123!');
      fireEvent.press(screen.getByText('Log In'));

      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith('Sign in failed: Email is required');
      });
    });
  });

  describe('T017: Form validation catches missing password', () => {
    it('shows error when password is blank', async () => {
      render(<Index />);
      
      fireEvent.changeText(screen.getByPlaceholderText('Email'), 'student@rutgers.edu');
      fireEvent.changeText(screen.getByPlaceholderText('Password'), '');
      fireEvent.press(screen.getByText('Log In'));

      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith('Sign in failed: Password is required');
      });
    });
  });
});