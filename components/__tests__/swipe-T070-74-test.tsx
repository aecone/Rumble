import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SwipeTab from '@/app/(tabs)/swipeTab';

// Add this at the top of your test file
beforeAll(() => {
    global.fetch = jest.fn() as jest.Mock;
  });
  
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/suggested_users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ users: mockUsers }),
        });
      }
      if (url.includes('/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ profile: { userType: 'mentor' } }),
        });
      }
      if (url.includes('/swipe')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ match: false }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

// 1. First mock the problematic modules
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Ionicons', // Simple mock component
}));

// 2. Mock other native modules if needed
jest.mock('expo-modules-core', () => ({}));

// 3. Setup fetch mock
beforeAll(() => {
  global.fetch = jest.fn() as jest.Mock;
});

// 4. Mock response helper
const createMockResponse = (data: any, ok: boolean = true) => ({
  ok,
  json: () => Promise.resolve(data),
  headers: new Headers(),
  redirected: false,
  status: 200,
  statusText: 'OK',
  type: 'basic',
  url: 'http://test.com',
});

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: 'GestureHandlerRootView',
    PanGestureHandler: 'PanGestureHandler',
    PanGestureHandlerGestureEvent: {},
    State: {},
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock('../../FirebaseConfig', () => ({
  auth: { currentUser: { getIdToken: jest.fn(() => Promise.resolve('mock-token')) } },
  API_BASE_URL: 'http://mock-api',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(JSON.stringify({}))),
  setItem: jest.fn(() => Promise.resolve()),
}));

// swipe-T070-test.tsx
// swipe-T070-test.tsx
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return Object.setPrototypeOf(
    {
      ...RN,
      // Ensure all components used in your SwipeTab are properly mocked
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

// Test data

describe('SwipeTab Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
      const url = input.toString();
      
      if (url.includes('/suggested_users')) {
        return Promise.resolve(createMockResponse({ users: mockUsers }));
      }
      if (url.includes('/profile')) {
        return Promise.resolve(createMockResponse({ profile: { userType: 'mentor' } }));
      }
      if (url.includes('/swipe')) {
        return Promise.resolve(createMockResponse({ match: false }));
      }
      return Promise.resolve(createMockResponse({}));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('T070: should record swipe right as interested', async () => {
    // Mock initial data load
    (global.fetch as jest.Mock).mockImplementationOnce((url) => {
      if (url.includes('/suggested_users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ users: mockUsers }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    render(<SwipeTab />);
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/suggested_users'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  
    // Find and click the like button
    const likeButton = await screen.findByText('✓');
    fireEvent.press(likeButton);
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/swipe'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ swipedID: 'user1' }),
        })
      );
    });
  });

  it('T071: should skip profile when swiping left', async () => {
    render(<SwipeTab />);

    const skipButton = await screen.findByText('✕');
    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // initial load + profile
    });
  });

  it('should show match alert when swipe results in a match', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/swipe')) {
        return Promise.resolve(createMockResponse({ match: true }));
      }
      return Promise.resolve(createMockResponse({ users: mockUsers }));
    });

    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<SwipeTab />);

    const likeButton = await screen.findByText('✓');
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining("It's a Match!"),
        expect.stringContaining("John")
      );
    });
  });

  it('should show empty state when no users available', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/suggested_users')) {
        return Promise.resolve(createMockResponse({ users: [] }));
      }
      return Promise.resolve(createMockResponse({ profile: { userType: 'mentor' } }));
    });

    render(<SwipeTab />);

    const emptyMessage = await screen.findByText('No more users to swipe on.');
    expect(emptyMessage).toBeTruthy();
  });
});

const mockUsers = [
    {
      id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      userType: 'mentee',
      bio: 'Test bio',
      major: 'Computer Science',
    },
    {
      id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      userType: 'mentee',
      bio: 'Test bio',
      major: 'Engineering',
    },
  ];
  
  describe('SwipeTab Component', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
        const url = input.toString();
        
        if (url.includes('/suggested_users')) {
          return Promise.resolve(createMockResponse({ users: mockUsers }));
        }
        if (url.includes('/profile')) {
          return Promise.resolve(createMockResponse({ profile: { userType: 'mentor' } }));
        }
        if (url.includes('/swipe')) {
          return Promise.resolve(createMockResponse({ match: false }));
        }
        return Promise.resolve(createMockResponse({}));
      });
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Existing tests remain the same...
  
    // Test Case T072: Swipe advances to next user
    it('T072: should show next profile after swipe', async () => {
      render(<SwipeTab />);
  
      // Verify first user is shown
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeTruthy();
      });
  
      // Swipe right
      fireEvent.press(screen.getByText('✓'));
  
      // Verify next user is shown
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeTruthy();
        expect(screen.queryByText('John Doe')).toBeNull();
      });
  
      // Swipe left
      fireEvent.press(screen.getByText('✕'));
  
      // Verify empty state
      await waitFor(() => {
        expect(screen.getByText('No more users to swipe on.')).toBeTruthy();
      });
    });
  
    // Test Case T073: Handle end of stack gracefully
    it('T073: should show empty state when no more users', async () => {
      // Mock empty user list
      (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.includes('/suggested_users')) {
          return Promise.resolve(createMockResponse({ users: [] }));
        }
        return Promise.resolve(createMockResponse({ profile: { userType: 'mentor' } }));
      });
  
      render(<SwipeTab />);
  
      // Verify empty state message
      await waitFor(() => {
        expect(screen.getByText('No more users to swipe on.')).toBeTruthy();
      });
  
      // Verify swipe buttons are disabled/hidden
      expect(screen.queryByText('✓')).toBeNull();
      expect(screen.queryByText('✕')).toBeNull();
    });
  
    // Test Case T074: Mutual interest creates match
    it('T074: should create match when both users swipe right', async () => {
      // Mock mutual like scenario
      (global.fetch as jest.Mock).mockImplementationOnce((input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.includes('/swipe')) {
          return Promise.resolve(createMockResponse({ match: true }));
        }
        return Promise.resolve(createMockResponse({ users: mockUsers }));
      });
  
      const alertSpy = jest.spyOn(Alert, 'alert');
      render(<SwipeTab />);
  
      // Swipe right on first user
      fireEvent.press(screen.getByText('✓'));
  
      // Verify match notification
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "🎉 It's a Match!",
          "You matched with John"
        );
      });
  
      // Verify API was called to record match
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/swipe'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ swipedID: 'user1' }),
        })
      );
    });
  });