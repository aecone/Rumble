// swipe-T077-T079-test.tsx

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import SwipeTab from '@/app/(tabs)/swipeTab';
import { Dimensions, Alert } from 'react-native';



jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useFocusEffect: jest.fn((cb) => cb()), // run once
    useRouter: () => ({ push: jest.fn() }),
    useLocalSearchParams: jest.fn(() => ({})),
  };
});


jest.mock('node-emoji', () => ({
    get: (emoji: any) => `:${emoji}:`,
    find: jest.fn(),
    search: jest.fn(),
    emojify: (str: any) => str, // Just return original string for testing
  }));
  

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: () => React.createElement('Ionicons'),
  };
});

jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  requireNativeModule: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
    const React = require('react');
    const { View } = require('react-native');
  
    const createHandler = () => ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  
    return {
      GestureHandlerRootView: View,
      PanGestureHandler: createHandler(),
      TapGestureHandler: createHandler(),
      LongPressGestureHandler: createHandler(),
      FlingGestureHandler: createHandler(),
      State: {},
      Directions: {},
    };
  });
  

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

global.fetch = jest.fn(() =>
  Promise.resolve(
    new Response(JSON.stringify({ users: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  )
) as jest.Mock;

const SCREEN_WIDTH = Dimensions.get('window').width;


describe('SwipeTab Animation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T077: shows swipe-right animation when swiping right', async () => {
    const { getByText } = render(<SwipeTab />);
    await act(async () => {
      fireEvent.press(getByText('✓'));
    });
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('T078: shows swipe-left animation when swiping left', async () => {
    const { getByText } = render(<SwipeTab />);
    await act(async () => {
      fireEvent.press(getByText('✕'));
    });
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('T079: shows match animation when mutual swipe occurs', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({
          users: [{
            id: '1',
            firstName: 'Matchy',
            lastName: 'Person',
            userType: 'mentee',
            profilePictureUrl: null
          }]
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    ).mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ match: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    const { getByText } = render(<SwipeTab />);
    await act(async () => {
      fireEvent.press(getByText('✓'));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "🎉 It's a Match!",
        expect.stringMatching(/You matched with Matchy/)
      );
    });
  });
});
