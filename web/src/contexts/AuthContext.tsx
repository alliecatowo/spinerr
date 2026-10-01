"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { initializeFirebase } from '@/lib/firebase';
import { signInAnonymous, onAuthChange, createAccount, signIn, signInWithGoogle, signOut } from '@/lib/auth';
import { loadTourStateFromFirebase, syncTourStateToFirebase } from '@/lib/tour-firebase';
import { useTourStore } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  signInAnon: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogleOAuth: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Firebase
    initializeFirebase();

    // Subscribe to auth changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('[AuthProvider] Auth state changed:', {
        uid: firebaseUser?.uid,
        isAnonymous: firebaseUser?.isAnonymous,
        email: firebaseUser?.email,
      });

      setUser(firebaseUser);
      setLoading(false);

      // Load tour state from Firebase for this user
      if (firebaseUser) {
        const tourState = await loadTourStateFromFirebase(firebaseUser);
        if (tourState) {
          // Update Zustand store with Firebase state
          const { hasSeenOnboarding, hasSeenLibraryTour, hasSeenPlayerTour, hasSeenSettingsTour } = tourState;
          // Batch update to prevent multiple re-renders
          useTourStore.setState({
            hasSeenOnboarding,
            hasSeenLibraryTour,
            hasSeenPlayerTour,
            hasSeenSettingsTour,
          });
          console.log('[AuthProvider] Loaded tour state from Firebase');
        }
      }

      // If no user, auto-sign in anonymously for seamless experience
      if (!firebaseUser) {
        console.log('[AuthProvider] No user detected, signing in anonymously...');
        try {
          await signInAnonymous();
          setError(null); // Clear any previous errors
        } catch (error: any) {
          console.error('[AuthProvider] Anonymous sign-in failed:', error);

          // Handle configuration not found error
          if (error?.code === 'auth/configuration-not-found') {
            const msg = 'Firebase Authentication not enabled. Running in localStorage-only mode. See FIREBASE_SETUP.md';
            console.warn('[AuthProvider]', msg);
            setError(msg);
            setLoading(false);
            // Don't block the app - it will work with localStorage only
          } else {
            setError(error?.message || 'Authentication error');
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAnon = async () => {
    setLoading(true);
    try {
      await signInAnonymous();
    } catch (error) {
      console.error('[AuthProvider] Anonymous sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Create account (will upgrade anonymous user via linkWithCredential)
      // Firebase automatically preserves the user's data when upgrading
      await createAccount(email, password);
      console.log('[AuthProvider] ✓ Account created! Your library is preserved.');
    } catch (error) {
      console.error('[AuthProvider] Sign-up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('[AuthProvider] Sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleOAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      console.log('[AuthProvider] ✓ Signed in with Google! Your library is preserved.');
    } catch (error) {
      console.error('[AuthProvider] Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut();
      // After sign out, auto sign-in anonymously
      await signInAnonymous();
    } catch (error) {
      console.error('[AuthProvider] Sign-out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAnonymous: user?.isAnonymous || false,
        signInAnon,
        signUp,
        signInWithEmail,
        signInWithGoogleOAuth,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
