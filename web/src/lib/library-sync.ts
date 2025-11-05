import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { Album, Track } from './store';

const STORAGE_KEY_ALBUMS = 'spinerr_albums';
const STORAGE_KEY_RECENTLY_PLAYED = 'spinerr_recently_played';

/**
 * Library storage interface
 * Abstracts between localStorage (anonymous) and Firestore (authenticated)
 */
export interface LibraryStorage {
  getAlbums(): Promise<Album[]>;
  saveAlbums(albums: Album[]): Promise<void>;
  getRecentlyPlayed(): Promise<Album[]>;
  saveRecentlyPlayed(albums: Album[]): Promise<void>;
}

/**
 * LocalStorage implementation (for anonymous users)
 */
export const LocalLibraryStorage: LibraryStorage = {
  async getAlbums(): Promise<Album[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY_ALBUMS);
    return data ? JSON.parse(data) : [];
  },

  async saveAlbums(albums: Album[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(albums));
  },

  async getRecentlyPlayed(): Promise<Album[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY_RECENTLY_PLAYED);
    return data ? JSON.parse(data) : [];
  },

  async saveRecentlyPlayed(albums: Album[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_RECENTLY_PLAYED, JSON.stringify(albums));
  },
};

/**
 * Firestore implementation (for authenticated users)
 */
export function createFirestoreStorage(userId: string): LibraryStorage {
  return {
    async getAlbums(): Promise<Album[]> {
      const db = getFirebaseDb();
      const albumsRef = collection(db, 'users', userId, 'albums');
      const snapshot = await getDocs(albumsRef);
      return snapshot.docs.map((doc) => doc.data() as Album);
    },

    async saveAlbums(albums: Album[]): Promise<void> {
      const db = getFirebaseDb();
      const batch = writeBatch(db);

      albums.forEach((album) => {
        const albumRef = doc(db, 'users', userId, 'albums', album.id);
        batch.set(albumRef, album);
      });

      await batch.commit();
    },

    async getRecentlyPlayed(): Promise<Album[]> {
      const db = getFirebaseDb();
      const libraryRef = doc(db, 'users', userId, 'library', 'recentlyPlayed');
      const snapshot = await getDoc(libraryRef);
      return snapshot.exists() ? (snapshot.data().albums as Album[]) : [];
    },

    async saveRecentlyPlayed(albums: Album[]): Promise<void> {
      const db = getFirebaseDb();
      const libraryRef = doc(db, 'users', userId, 'library', 'recentlyPlayed');
      await setDoc(libraryRef, { albums });
    },
  };
}

/**
 * Migrate library data from localStorage to Firestore
 * Called when an anonymous user creates an account
 */
export async function migrateLibraryToFirestore(userId: string): Promise<void> {
  console.log('[LibrarySync] Starting migration from localStorage to Firestore...');

  try {
    // Get data from localStorage
    const localAlbums = await LocalLibraryStorage.getAlbums();
    const localRecentlyPlayed = await LocalLibraryStorage.getRecentlyPlayed();

    if (localAlbums.length === 0 && localRecentlyPlayed.length === 0) {
      console.log('[LibrarySync] No local data to migrate');
      return;
    }

    // Save to Firestore
    const firestoreStorage = createFirestoreStorage(userId);

    if (localAlbums.length > 0) {
      await firestoreStorage.saveAlbums(localAlbums);
      console.log(`[LibrarySync] Migrated ${localAlbums.length} albums to Firestore`);
    }

    if (localRecentlyPlayed.length > 0) {
      await firestoreStorage.saveRecentlyPlayed(localRecentlyPlayed);
      console.log(`[LibrarySync] Migrated ${localRecentlyPlayed.length} recently played albums to Firestore`);
    }

    // Keep localStorage as backup (user preference - don't clear)
    console.log('[LibrarySync] Migration complete! Local data preserved as backup.');
  } catch (error) {
    console.error('[LibrarySync] Migration failed:', error);
    throw error;
  }
}

/**
 * Get appropriate storage based on auth state
 */
export function getLibraryStorage(userId: string | null): LibraryStorage {
  if (userId) {
    return createFirestoreStorage(userId);
  }
  return LocalLibraryStorage;
}
