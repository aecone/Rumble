// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2xRl4T9TGRzHRB6VRVVmhP8laHHFLABQ",
  authDomain: "rumble-swipeconnect.firebaseapp.com",
  projectId: "rumble-swipeconnect",
  storageBucket: "rumble-swipeconnect.firebasestorage.app",
  messagingSenderId: "422725323894",
  appId: "1:422725323894:web:0acf9ec44f7e0775472357",
  measurementId: "G-4N259DXX23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };
export const googleAuthConfig = {
  expoClientId: "422725323894-aibv8o3npa4ufish8g5b2j9q2o42eqc8.apps.googleusercontent.com",
  // Don't need these for now since we don't have a published app
  // androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  // iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  webClientId: "Y422725323894-aibv8o3npa4ufish8g5b2j9q2o42eqc8.apps.googleusercontent.com",
};
