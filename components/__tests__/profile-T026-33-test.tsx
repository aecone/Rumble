import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer
import TabFourScreen from '../../app/(tabs)/profileTab';  // Adjust the import as necessary

// Mock expo-router
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: mockRouterPush,
  },
}));

// Mock Expo Image Picker
jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(() => Promise.resolve({ cancelled: true })),
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  }));

// Mock Firebase auth
const mockUpdateEmail = jest.fn();
const mockUpdatePassword = jest.fn();
// Mock Firebase auth
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
      onAuthStateChanged: jest.fn((callback) => {
        // Simulate a user being logged in
        callback({ uid: 'test-uid' });
      }),
    })),
    updateEmail: jest.fn(),
    updatePassword: jest.fn(),
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

describe('TabFourScreen Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('T026 - Should allow user to update their email successfully', () => {
    it('displays success message when email is updated', async () => {
      mockUpdateEmail.mockResolvedValueOnce({});

      // Wrap TabFourScreen in NavigationContainer for navigation context
      render(
        <NavigationContainer>
          <TabFourScreen />
        </NavigationContainer>
      );

      fireEvent.changeText(screen.getByPlaceholderText('New Email'), 'newstudent@scarletmail.rutgers.edu');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockUpdateEmail).toHaveBeenCalledWith('newstudent@scarletmail.rutgers.edu');
        expect(screen.getByText('Email updated successfully')).toBeTruthy();
      });
    });
  });

  describe('T027 - Should prevent using an already registered email', () => {
    it('shows error message when email is already in use', async () => {
      mockUpdateEmail.mockRejectedValueOnce(new Error('This email is already in use'));

      // Wrap TabFourScreen in NavigationContainer for navigation context
      render(
        <NavigationContainer>
          <TabFourScreen />
        </NavigationContainer>
      );

      fireEvent.changeText(screen.getByPlaceholderText('New Email'), 'existing@rutgers.edu');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('This email is already in use')).toBeTruthy();
      });
    });
  });

  describe('T028 - Should enforce domain restriction on email update', () => {
    it('shows error message when email domain is not allowed', async () => {
      render(
        <NavigationContainer>
          <TabFourScreen />
        </NavigationContainer>
      );

      fireEvent.changeText(screen.getByPlaceholderText('New Email'), 'user@gmail.com');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Only @rutgers.edu or @scarletmail.rutgers.edu emails are allowed')).toBeTruthy();
      });
    });
  });

  describe('T029 - Should prevent malformed institutional emails', () => {
    it('shows error message when email format is invalid', async () => {
      render(
        <NavigationContainer>
          <TabFourScreen />
        </NavigationContainer>
      );

      fireEvent.changeText(screen.getByPlaceholderText('New Email'), 'user@scarletmai.rutgers.edu');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeTruthy();
      });
    });
  });

  describe('T030 - Should update password successfully with valid input', () => {
    it('displays success message when password is updated', async () => {
      mockUpdatePassword.mockResolvedValueOnce({});

      render(
        <NavigationContainer>
          <TabFourScreen />
        </NavigationContainer>
      );

      fireEvent.changeText(screen.getByPlaceholderText('New Password'), 'NewStrongPass123!');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalledWith('NewStrongPass123!');
        expect(screen.getByText('Password updated successfully')).toBeTruthy();
      });
    });
  });

  describe('T031 - Should prevent weak passwords', () => {
    it('shows error message when password is too weak', async () => {
      render(
        <NavigationContainer>
          <TabFourScreen />
        </NavigationContainer>
      );

      fireEvent.changeText(screen.getByPlaceholderText('New Password'), '123');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters and include letters & numbers')).toBeTruthy();
      });
    });
  });

  describe('T032 - Should prevent blank password input', () => {
    it('shows error message when password is left blank', async () => {
      render(
        <NavigationContainer>
          <TabFourScreen />
        </NavigationContainer>
      );

      fireEvent.changeText(screen.getByPlaceholderText('New Password'), '');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Password cannot be empty')).toBeTruthy();
      });
    });
  });

  describe('T033 - Should handle blank email input properly', () => {
    it('shows error message when email is left blank', async () => {
      render(
        <NavigationContainer>
          <TabFourScreen />
        </NavigationContainer>
      );

      fireEvent.changeText(screen.getByPlaceholderText('New Email'), '');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Email cannot be empty')).toBeTruthy();
      });
    });
  });
});
