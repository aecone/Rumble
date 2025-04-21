import { TextStyle, ViewStyle } from "react-native";

// jest.setup.ts


// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}));

// Mock Firebase
jest.mock('./FirebaseConfig', () => ({
  auth: {},
  db: {},
  storage: {},
  app: {},
  googleAuthConfig: {
    expoClientId: "mock-id",
    webClientId: "mock-web-id",
  },
  API_BASE_URL: "http://mock-api.com/api"
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  fetchSignInMethodsForEmail: jest.fn(),
  initializeAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn()
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn()
}));

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

// Mock React Native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// Update the react-native mock section with proper typing
jest.mock('react-native', () => jest.requireActual('./__mocks__/react-native'));

// Handle console.error during tests to see test failures more clearly
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/.test(args[0]) ||
    /Warning: The current testing environment/.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};