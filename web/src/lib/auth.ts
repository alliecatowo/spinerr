import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

/**
 * Get the Auth instance or throw a readable error when this build has no
 * Firebase config (e.g. a fork or CI build without NEXT_PUBLIC_FIREBASE_*).
 */
function requireAuth(): Auth {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Sign-in is not available in this build (Firebase is not configured).');
  }
  return auth;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
}

/**
 * Sign in anonymously
 * This creates a temporary anonymous account that can be upgraded later
 */
export async function signInAnonymous(): Promise<User> {
  const auth = requireAuth();
  const result = await signInAnonymously(auth);
  return result.user;
}

/**
 * Create a permanent account with email/password
 * If user is currently anonymous, this will link the anonymous account
 * to the new email account, preserving all data
 */
export async function createAccount(email: string, password: string): Promise<User> {
  const auth = requireAuth();
  const currentUser = auth.currentUser;

  // If user is anonymous, upgrade their account
  if (currentUser && currentUser.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(currentUser, credential);
    return result.user;
  }

  // Otherwise create a new account
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign in with email/password
 */
export async function signIn(email: string, password: string): Promise<User> {
  const auth = requireAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign in with Google OAuth
 * If user is currently anonymous, this will link the anonymous account
 */
export async function signInWithGoogle(): Promise<User> {
  const auth = requireAuth();
  const currentUser = auth.currentUser;
  const provider = new GoogleAuthProvider();

  // If user is anonymous, upgrade their account by linking
  if (currentUser && currentUser.isAnonymous) {
    // Sign in with popup to get Google credential
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  // Otherwise sign in with Google normally
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const auth = requireAuth();
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return getFirebaseAuth()?.currentUser ?? null;
}
