"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { initializeFirebase } from '@/lib/firebase';
import { signInAnonymous, onAuthChange, createAccount, signIn, signOut } from '@/lib/auth';
import { migrateLibraryToFirestore } from '@/lib/library-sync';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  signInAnon: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

      // If no user, auto-sign in anonymously for seamless experience
      if (!firebaseUser) {
        console.log('[AuthProvider] No user detected, signing in anonymously...');
        try {
          await signInAnonymous();
        } catch (error) {
          console.error('[AuthProvider] Anonymous sign-in failed:', error);
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
      const wasAnonymous = user?.isAnonymous || false;
      const previousUserId = user?.uid;

      // Create account (will upgrade if anonymous)
      await createAccount(email, password);

      // If upgrading from anonymous, migrate library data
      if (wasAnonymous && previousUserId) {
        console.log('[AuthProvider] Migrating library from anonymous account...');
        await migrateLibraryToFirestore(previousUserId);
        console.log('[AuthProvider] ✓ Your library has been saved to your account!');
      }
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
