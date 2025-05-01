import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import ProfileTab from '../../app/(tabs)/profileTab';  // Adjust the import to the correct path
import { Alert } from 'react-native';
import { API_BASE_URL } from '../../FirebaseConfig';
import { auth } from '../../FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';

// Mocking the necessary dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Ionicons', // Simple mock component
}));

jest.mock('expo-modules-core', () => ({}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock('react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(JSON.stringify({}))),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return Object.setPrototypeOf(
    {
      ...RN,
      View: 'View',
      Text: 'Text',
      TouchableOpacity: 'TouchableOpacity',
      SafeAreaView: 'SafeAreaView',
      ScrollView: 'ScrollView',
      Image: 'Image',
      Animated: {
        ...RN.Animated,
        View: 'Animated.View',
        Text: 'Animated.Text',
        Image: 'Animated.Image',
        ScrollView: 'Animated.ScrollView',
        Value: jest.fn(() => ({
          interpolate: jest.fn(),
          setValue: jest.fn(),
        })),
        ValueXY: jest.fn(() => ({
          x: { interpolate: jest.fn(), setValue: jest.fn() },
          y: { interpolate: jest.fn(), setValue: jest.fn() },
          setValue: jest.fn(),
          getLayout: jest.fn(),
          getTranslateTransform: jest.fn(),
        })),
        event: jest.fn(() => {
          return () => {}; // Return a function that does nothing
        }),
        timing: jest.fn(),
        spring: jest.fn(),
      },
      Dimensions: {
        get: jest.fn().mockReturnValue({ width: 375, height: 667 }),
      },
      useWindowDimensions: jest.fn(() => ({ 
        width: 375, 
        height: 667,
        scale: 1,
        fontScale: 1,
      })),
      Alert: {
        alert: jest.fn(),
      },
      StyleSheet: {
        create: jest.fn((styles) => styles),
        flatten: jest.fn(),
        hairlineWidth: 1,
      },
    },
    RN
  );
});

jest.mock('node-emoji', () => ({
  get: jest.fn(() => '🌟'),
  find: jest.fn(() => ({ emoji: '🌟' })),
  search: jest.fn(() => [{ emoji: '🌟' }]),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('../../FirebaseConfig', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(() => Promise.resolve('mock-token')),
      email: 'test@domain.com',
      uid: 'mock-user-id',
    }
  },
  API_BASE_URL: 'http://mock-api',
}));

// Mock data for tests
const mockProfile = {
  settings: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    birthday: '1990-01-01',
    ethnicity: 'Caucasian',
    gender: 'Male',
    pronouns: 'he/him',
  },
  profile: {
    bio: 'Hello',
    profilePictureUrl: '',
    major: 'Computer Science',
    gradYear: 2023,
    hobbies: ['Reading', 'Gaming'],
    orgs: ['Tech Club'],
    careerPath: 'Software Engineering',
    interestedIndustries: ['Technology'],
    userType: 'Mentee',
    mentorshipAreas: ['Career development'],
  }
};

describe('ProfileTab Component', () => {
  beforeEach(() => {
    // Mock the fetch calls for profile and update
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfile),
        });
      }

      if (url.includes('/update_profile') || url.includes('/update_settings')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('T056: should update and save the name successfully', async () => {
    render(<ProfileTab />);

    // Start editing mode
    fireEvent.press(screen.getByText('Edit'));

    // Change name values
    const firstNameInput = screen.getByPlaceholderText('First Name');
    const lastNameInput = screen.getByPlaceholderText('Last Name');
    
    fireEvent.changeText(firstNameInput, 'Jordan');
    fireEvent.changeText(lastNameInput, 'Smith');
    
    // Save changes
    fireEvent.press(screen.getByText('Save'));

    // Ensure profile has updated values
    await waitFor(() => {
      expect(screen.getByText('Jordan Smith')).toBeTruthy();
    });
  });

  it('T057: should update and save gender and pronouns successfully', async () => {
    render(<ProfileTab />);

    // Start editing mode
    fireEvent.press(screen.getByText('Edit'));

    // Change gender and pronouns
    const genderInput = screen.getByPlaceholderText('Gender');
    const pronounsInput = screen.getByPlaceholderText('Pronouns');
    
    fireEvent.changeText(genderInput, 'Non-binary');
    fireEvent.changeText(pronounsInput, 'they/them');
    
    // Save changes
    fireEvent.press(screen.getByText('Save'));

    // Ensure profile has updated values
    await waitFor(() => {
      expect(screen.getByText('Non-binary')).toBeTruthy();
      expect(screen.getByText('they/them')).toBeTruthy();
    });
  });

  it('T058: should update and save major successfully', async () => {
    render(<ProfileTab />);

    // Start editing mode
    fireEvent.press(screen.getByText('Edit'));

    // Change major
    const majorInput = screen.getByPlaceholderText('Major');
    
    fireEvent.changeText(majorInput, 'Public Health');
    
    // Save changes
    fireEvent.press(screen.getByText('Save'));

    // Ensure profile has updated value
    await waitFor(() => {
      expect(screen.getByText('Public Health')).toBeTruthy();
    });
  });

  it('T059: should update and save ethnicity successfully', async () => {
    render(<ProfileTab />);

    // Start editing mode
    fireEvent.press(screen.getByText('Edit'));

    // Change ethnicity
    const ethnicityInput = screen.getByPlaceholderText('Ethnicity');
    
    fireEvent.changeText(ethnicityInput, 'Latino');
    
    // Save changes
    fireEvent.press(screen.getByText('Save'));

    // Ensure profile has updated value
    await waitFor(() => {
      expect(screen.getByText('Latino')).toBeTruthy();
    });
  });

  it('T060: should show error when name is left blank', async () => {
    render(<ProfileTab />);

    // Start editing mode
    fireEvent.press(screen.getByText('Edit'));

    // Leave name blank and try to save
    const firstNameInput = screen.getByPlaceholderText('First Name');
    const lastNameInput = screen.getByPlaceholderText('Last Name');
    
    fireEvent.changeText(firstNameInput, '');
    fireEvent.changeText(lastNameInput, '');
    
    fireEvent.press(screen.getByText('Save'));

    // Check if error message appears
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeTruthy();
    });
  });

  it('T061: should update all fields successfully when all are modified', async () => {
    render(<ProfileTab />);

    // Start editing mode
    fireEvent.press(screen.getByText('Edit'));

    // Modify all fields
    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Jordan');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Smith');
    fireEvent.changeText(screen.getByPlaceholderText('Gender'), 'Non-binary');
    fireEvent.changeText(screen.getByPlaceholderText('Pronouns'), 'they/them');
    fireEvent.changeText(screen.getByPlaceholderText('Major'), 'Public Health');
    fireEvent.changeText(screen.getByPlaceholderText('Ethnicity'), 'Latino');

    // Save changes
    fireEvent.press(screen.getByText('Save'));

    // Ensure all fields are updated
    await waitFor(() => {
      expect(screen.getByText('Jordan Smith')).toBeTruthy();
      expect(screen.getByText('Non-binary')).toBeTruthy();
      expect(screen.getByText('they/them')).toBeTruthy();
      expect(screen.getByText('Public Health')).toBeTruthy();
      expect(screen.getByText('Latino')).toBeTruthy();
    });
  });

  it('T062: should persist profile changes after re-login', async () => {
    render(<ProfileTab />);

    // Modify profile data
    fireEvent.press(screen.getByText('Edit'));
    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Jordan');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Smith');
    fireEvent.press(screen.getByText('Save'));

    // Simulate logout and login
    fireEvent.press(screen.getByText('Logout'));
    
    // Ensure name persists after re-login
    await waitFor(() => {
      expect(screen.getByText('Jordan Smith')).toBeTruthy();
    });
  });

  it('T063: should revert changes when edit is canceled', async () => {
    render(<ProfileTab />);

    // Start editing mode
    fireEvent.press(screen.getByText('Edit'));

    // Modify some fields
    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Jordan');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Smith');

    // Cancel edit
    fireEvent.press(screen.getByText('Cancel'));

    // Ensure original name is still displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });
});
