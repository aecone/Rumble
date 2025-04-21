// Mock react-native-screens
export const enableScreens = jest.fn();
export const Screen = jest.fn(() => null);
export const ScreenContainer = jest.fn(() => null);
export const getConstants = jest.fn(() => ({
  // Mock constants used by @react-navigation/native
  someConstant: true,
}));
