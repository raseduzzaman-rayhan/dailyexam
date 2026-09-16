import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoDummyKeyForAppletEnvironment2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'daily-exam-bd.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'daily-exam-bd',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'daily-exam-bd.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Export Authentication Helpers
export const registerWithEmailPassword = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithEmailPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const logoutFirebase = () => {
  return signOut(auth);
};

export const getCurrentIdToken = async (forceRefresh = false) => {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken(forceRefresh);
};

export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
