import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

const app: FirebaseApp | null = firebaseConfigured ? initializeApp(firebaseConfig) : null;

// Exported as nullable internally, but typed for easier imports.
// IMPORTANT: always guard usage with firebaseConfigured checks in hooks/components.
export const db = (app ? getFirestore(app) : null) as unknown as Firestore;
export const auth = (app ? getAuth(app) : null) as unknown as Auth;
export const googleProvider = (app ? new GoogleAuthProvider() : null) as unknown as GoogleAuthProvider;

if (firebaseConfigured && googleProvider) {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}
