

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
  FlatList
};