import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

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
  const auth = getFirebaseAuth();
  const result = await signInAnonymously(auth);
  console.log('[Auth] Anonymous sign in successful:', result.user.uid);
  return result.user;
}

/**
 * Create a permanent account with email/password
 * If user is currently anonymous, this will link the anonymous account
 * to the new email account, preserving all data
 */
export async function createAccount(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;

  // If user is anonymous, upgrade their account
  if (currentUser && currentUser.isAnonymous) {
    console.log('[Auth] Upgrading anonymous account to email/password');
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(currentUser, credential);
    console.log('[Auth] Account upgraded successfully:', result.user.email);
    return result.user;
  }

  // Otherwise create a new account
  const result = await createUserWithEmailAndPassword(auth, email, password);
  console.log('[Auth] New account created:', result.user.email);
  return result.user;
}

/**
 * Sign in with email/password
 */
export async function signIn(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  console.log('[Auth] Sign in successful:', result.user.email);
  return result.user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
  console.log('[Auth] Sign out successful');
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth.currentUser;
}
