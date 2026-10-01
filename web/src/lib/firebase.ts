import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

// Firebase configuration
// These are public and safe to commit - they identify your Firebase project
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * True when the NEXT_PUBLIC_FIREBASE_* values were provided at build time.
 * Without them the app still works (local playback, localStorage library);
 * only sign-in and cross-device sync are unavailable.
 */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase (singleton pattern)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initializeFirebase() {
  if (typeof window === 'undefined' || !isFirebaseConfigured) {
    // Don't initialize on the server, or when no config was provided
    return { app: null, auth: null, db: null };
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Connect to emulators in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  }

  return { app, auth, db };
}

// Getters return null when Firebase is not configured
export function getFirebaseApp(): FirebaseApp | null {
  if (!app) initializeFirebase();
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (!auth) initializeFirebase();
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  if (!db) initializeFirebase();
  return db;
}
