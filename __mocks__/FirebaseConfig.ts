// __mocks__/FirebaseConfig.ts
import { initializeAuth } from 'firebase/auth';
export const auth = jest.fn();
export const db = jest.fn();
export const storage = jest.fn();
export const app = jest.fn();
export const googleAuthConfig = {
  expoClientId: "mock-id",
  webClientId: "mock-web-id",
};

export const API_BASE_URL = "http://mock-api.com/api";