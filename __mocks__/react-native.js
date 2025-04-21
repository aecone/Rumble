

// __mocks__/react-native.js
export const Text = 'Text';
export const TextInput = 'TextInput';
export const TouchableOpacity = 'TouchableOpacity';
export const SafeAreaView = 'SafeAreaView';

export const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style, // Add this line
  hairlineWidth: 1,
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

// Add other components you need
export const View = 'View';
export const Button = 'Button';
export const FlatList = 'FlatList';
export const Alert = {
  alert: jest.fn(),
};

export const Dimensions = {
  get: (dim) => {
    if (dim === 'window') {
      return { width: 375, height: 667 }; // iPhone 8 size as a safe default
    }
    return { width: 0, height: 0 };
  }
};

export const useWindowDimensions = () => ({
  width: 375,
  height: 667,
});

const createValue = (initial = 0) => ({
  _value: initial,
  setValue: jest.fn(),
  interpolate: jest.fn(() => ({
    __isInterpolated__: true,
  })),
});

const createAnimatedValue = (initial = 0) => ({
  _value: initial,
  setValue: jest.fn(),
  interpolate: jest.fn(() => ({
    __interpolated: true,
    toString: () => 'interpolated-value',
  })),
});

export const Animated = {
  Value: jest.fn((val) => createAnimatedValue(val)),
  ValueXY: jest.fn(() => ({
    x: createAnimatedValue(),
    y: createAnimatedValue(),
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
  })),
  event: jest.fn(() => jest.fn()),
  timing: jest.fn(() => ({
    start: jest.fn((cb) => cb && cb()),
  })),
  spring: jest.fn(() => ({
    start: jest.fn((cb) => cb && cb()),
  })),
  decay: jest.fn(() => ({
    start: jest.fn((cb) => cb && cb()),
  })),
};






export const Platform = {
  OS: 'ios',
  select: (specifics) => specifics.ios,
};

// Default export
export default {
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  View,
  Button,
  Alert,
  Platform,
  FlatList,
  Dimensions
};