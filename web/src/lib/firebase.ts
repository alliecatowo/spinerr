import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

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

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    // Don't initialize on server
    return { app: null, auth: null, db: null };
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    console.log('[Firebase] Initialized with project:', firebaseConfig.projectId);
  }

  return { app, auth, db };
}

// Export getters for easy access
export function getFirebaseApp(): FirebaseApp {
  if (!app && typeof window !== 'undefined') {
    initializeFirebase();
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth && typeof window !== 'undefined') {
    initializeFirebase();
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db && typeof window !== 'undefined') {
    initializeFirebase();
  }
  return db;
}
