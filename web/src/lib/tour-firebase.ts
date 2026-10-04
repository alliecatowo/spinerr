import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { User } from 'firebase/auth';

export interface TourState {
  hasSeenOnboarding: boolean;
  hasSeenLibraryTour: boolean;
  hasSeenPlayerTour: boolean;
  hasSeenSettingsTour: boolean;
}

/**
 * Sync tour completion state to Firebase
 * This ensures tour state persists across devices and sessions
 */
export async function syncTourStateToFirebase(user: User | null, tourState: TourState): Promise<void> {
  if (!user) {
    return;
  }

  const db = getFirebaseDb();
  if (!db) {
    console.warn('[tour-firebase] Firestore not available');
    return;
  }

  try {
    const tourRef = doc(db, 'users', user.uid, 'preferences', 'tours');
    await setDoc(tourRef, tourState, { merge: true });
  } catch (error) {
    console.error('[tour-firebase] Failed to sync tour state:', error);
  }
}

/**
 * Load tour completion state from Firebase
 * Returns null if no state exists (first-time user)
 */
export async function loadTourStateFromFirebase(user: User | null): Promise<TourState | null> {
  if (!user) {
    return null;
  }

  const db = getFirebaseDb();
  if (!db) {
    console.warn('[tour-firebase] Firestore not available');
    return null;
  }

  try {
    const tourRef = doc(db, 'users', user.uid, 'preferences', 'tours');
    const tourDoc = await getDoc(tourRef);

    if (tourDoc.exists()) {
      const data = tourDoc.data() as TourState;
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('[tour-firebase] Failed to load tour state:', error);
    return null;
  }
}
