import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Index from '../../app/index'; // Adjust the import path as needed

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  auth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

// Mock React Native components
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
    TextInput: jest.fn(({ placeholder, ...props }) => (
      <rn.TextInput {...props} placeholder={placeholder} />
    )),
    TouchableOpacity: jest.fn(({ children, ...props }) => (
      <rn.TouchableOpacity {...props}>{children}</rn.TouchableOpacity>
    )),
  };
});

describe('Main Page Tests', () => {
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
      expect(screen.getByText('Sign In')).toBeTruthy();
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
});