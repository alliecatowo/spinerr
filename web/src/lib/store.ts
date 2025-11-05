import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Album, Track as ProviderTrack, PlaylistRecord, UserLibrary } from './providers/types';
import { getCurrentUser } from './auth';
import { syncTourStateToFirebase } from './tour-firebase';

// Types
export type ViewMode = 'music' | 'both' | 'calendar';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl?: string; // album artwork
  duration: number; // in seconds
  coverColor: string; // hex color
  genre?: string; // optional genre field
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'meeting' | 'appointment' | 'birthday' | 'reminder';
  description: string;
}

// Player Store
interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0-1
  volume: number; // 0-1
  playlist: Track[];

  // Actions
  play: () => void;
  pause: () => void;
  setTrack: (track: Track) => void;
  updateProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setPlaylist: (playlist: Track[]) => void;
  loadAlbum: (album: Album) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: 0.7,
  playlist: [],

  play: () => {
    set({ isPlaying: true });
    // Trigger audio player
    if (typeof window !== 'undefined') {
      import('./audio-player').then(({ getAudioPlayer }) => {
        getAudioPlayer().play().catch((error) => {
          console.error('[Store] Play error, reverting state:', error);
          set({ isPlaying: false });
        });
      });
    }
  },

  pause: () => {
    set({ isPlaying: false });
    // Trigger audio player
    if (typeof window !== 'undefined') {
      import('./audio-player').then(({ getAudioPlayer }) => {
        getAudioPlayer().pause();
      }).catch((error) => {
        console.error('[Store] Pause error:', error);
      });
    }
  },

  setTrack: (track: Track) => set({
    currentTrack: track,
    isPlaying: false, // Don't auto-play
    progress: 0
  }),

  updateProgress: (progress: number) => set({
    progress: Math.max(0, Math.min(1, progress))
  }),

  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ volume: clampedVolume });
    // Sync with audio player
    if (typeof window !== 'undefined') {
      import('./audio-player').then(({ getAudioPlayer }) => {
        getAudioPlayer().setVolume(clampedVolume);
      });
    }
  },

  nextTrack: () => {
    const { currentTrack, playlist, isPlaying } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];

    set({
      currentTrack: nextTrack,
      isPlaying, // Keep current playing state
      progress: 0
    });

    // Load next track in audio player
    if (typeof window !== 'undefined' && nextTrack) {
      import('./audio-player').then(({ getAudioPlayer }) => {
        const audioPlayer = getAudioPlayer();
        audioPlayer.loadTrack(nextTrack.id).then(() => {
          if (isPlaying) {
            audioPlayer.play();
          }
        });
      });
    }
  },

  prevTrack: () => {
    const { currentTrack, playlist, isPlaying } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    const prevTrack = playlist[prevIndex];

    set({
      currentTrack: prevTrack,
      isPlaying, // Keep current playing state
      progress: 0
    });

    // Load previous track in audio player
    if (typeof window !== 'undefined' && prevTrack) {
      import('./audio-player').then(({ getAudioPlayer }) => {
        const audioPlayer = getAudioPlayer();
        audioPlayer.loadTrack(prevTrack.id).then(() => {
          if (isPlaying) {
            audioPlayer.play();
          }
        });
      });
    }
  },

  setPlaylist: (playlist: Track[]) => set({ playlist }),

  loadAlbum: (album: Album) => {
    // Convert album tracks to player track format
    const playerTracks: Track[] = album.tracks.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: album.title,
      artworkUrl: album.artworkUrl || track.artworkUrl, // Use album or track artwork
      duration: track.duration,
      coverColor: '#8b5cf6', // Purple for albums
      genre: track.metadata?.genre,
    }));

    // Update store state
    set({
      playlist: playerTracks,
      currentTrack: playerTracks[0] || null,
      progress: 0,
      isPlaying: true,
    });

    // Load and play first track via audio player (client-side only)
    if (typeof window !== 'undefined' && playerTracks.length > 0) {
      import('./audio-player').then(({ getAudioPlayer }) => {
        const audioPlayer = getAudioPlayer();
        audioPlayer.initialize();
        audioPlayer.loadTrack(playerTracks[0].id).then(() => {
          audioPlayer.play();
        });
      });
    }
  },
}));

// Calendar Store
interface CalendarState {
  selectedDate: Date;
  events: CalendarEvent[];
  showCalendar: boolean;

  // Actions
  toggleCalendar: () => void;
  setShowCalendar: (show: boolean) => void;
  selectDate: (date: Date) => void;
  addEvent: (event: CalendarEvent) => void;
  removeEvent: (eventId: string) => void;
  setEvents: (events: CalendarEvent[]) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  events: [],
  showCalendar: true, // Default to showing calendar

  toggleCalendar: () => set((state) => ({ showCalendar: !state.showCalendar })),

  setShowCalendar: (show: boolean) => set({ showCalendar: show }),

  selectDate: (date: Date) => set({ selectedDate: date }),

  addEvent: (event: CalendarEvent) => set((state) => ({
    events: [...state.events, event]
  })),

  removeEvent: (eventId: string) => set((state) => ({
    events: state.events.filter(event => event.id !== eventId)
  })),

  setEvents: (events: CalendarEvent[]) => set({ events }),
}));

// Library Store - Album-focused music library management
interface LibraryState extends UserLibrary {
  // Actions
  addAlbum: (album: Album) => void;
  removeAlbum: (albumId: string) => void;
  toggleFavoriteTrack: (trackId: string) => void;
  addToRecentlyPlayed: (album: Album) => void;
  createPlaylist: (name: string, tracks: ProviderTrack[]) => void;
  updatePlaylist: (playlistId: string, tracks: ProviderTrack[]) => void;
  deletePlaylist: (playlistId: string) => void;
  clearLibrary: () => void;
}

const MAX_RECENTLY_PLAYED = 10;
const MIN_PLAYLIST_TRACKS = 4;
const MAX_PLAYLIST_TRACKS = 100;

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      // Initial state
      albums: [],
      playlists: [],
      recentlyPlayed: [],
      favorites: [],

      // Add album to library
      addAlbum: (album: Album) => set((state) => {
        // Check if album already exists
        if (state.albums.some(a => a.id === album.id && a.provider === album.provider)) {
          return state;
        }
        return {
          albums: [...state.albums, album]
        };
      }),

      // Remove album from library
      removeAlbum: (albumId: string) => set((state) => ({
        albums: state.albums.filter(a => a.id !== albumId),
        // Also remove from recently played
        recentlyPlayed: state.recentlyPlayed.filter(a => a.id !== albumId),
      })),

      // Toggle track favorite status
      toggleFavoriteTrack: (trackId: string) => set((state) => {
        const isFavorited = state.favorites.includes(trackId);
        return {
          favorites: isFavorited
            ? state.favorites.filter(id => id !== trackId)
            : [...state.favorites, trackId]
        };
      }),

      // Add album to recently played (max 10, most recent first)
      addToRecentlyPlayed: (album: Album) => set((state) => {
        // Remove album if it already exists
        const filtered = state.recentlyPlayed.filter(
          a => !(a.id === album.id && a.provider === album.provider)
        );
        // Add to front and limit to MAX_RECENTLY_PLAYED
        return {
          recentlyPlayed: [album, ...filtered].slice(0, MAX_RECENTLY_PLAYED)
        };
      }),

      // Create new playlist (enforces 4-100 track limit)
      createPlaylist: (name: string, tracks: ProviderTrack[]) => set((state) => {
        if (tracks.length < MIN_PLAYLIST_TRACKS) {
          console.warn(`Playlist must have at least ${MIN_PLAYLIST_TRACKS} tracks`);
          return state;
        }
        if (tracks.length > MAX_PLAYLIST_TRACKS) {
          console.warn(`Playlist cannot exceed ${MAX_PLAYLIST_TRACKS} tracks`);
          return state;
        }

        const newPlaylist: PlaylistRecord = {
          id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'playlist',
          title: name,
          trackCount: tracks.length,
          tracks: tracks,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          playlists: [...state.playlists, newPlaylist]
        };
      }),

      // Update existing playlist
      updatePlaylist: (playlistId: string, tracks: ProviderTrack[]) => set((state) => {
        if (tracks.length < MIN_PLAYLIST_TRACKS || tracks.length > MAX_PLAYLIST_TRACKS) {
          console.warn(`Playlist must have ${MIN_PLAYLIST_TRACKS}-${MAX_PLAYLIST_TRACKS} tracks`);
          return state;
        }

        return {
          playlists: state.playlists.map(p =>
            p.id === playlistId
              ? { ...p, tracks, trackCount: tracks.length, updatedAt: new Date() }
              : p
          )
        };
      }),

      // Delete playlist
      deletePlaylist: (playlistId: string) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== playlistId)
      })),

      // Clear entire library (for debugging/testing)
      clearLibrary: () => set({
        albums: [],
        playlists: [],
        recentlyPlayed: [],
        favorites: []
      }),
    }),
    {
      name: 'spinerr-library',
      version: 1,
    }
  )
);

// Tour Store - Guided tour state management
interface TourState {
  // Completion tracking
  hasSeenOnboarding: boolean;
  hasSeenLibraryTour: boolean;
  hasSeenPlayerTour: boolean;
  hasSeenSettingsTour: boolean;

  // Active tour management
  activeTour: string | null;
  tourStepIndex: number;
  runTour: boolean;

  // Actions
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  skipTour: (tourId: string) => void;
  resetAllTours: () => void;
  setStepIndex: (index: number) => void;
  stopTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      // Initial state
      hasSeenOnboarding: false,
      hasSeenLibraryTour: false,
      hasSeenPlayerTour: false,
      hasSeenSettingsTour: false,
      activeTour: null,
      tourStepIndex: 0,
      runTour: false,

      startTour: (tourId: string) => {
        console.log('[Tour] Starting:', tourId);
        set({
          activeTour: tourId,
          tourStepIndex: 0,
          runTour: true,
        });
      },

      completeTour: (tourId: string) => {
        console.log('[Tour] Completed:', tourId);

        // Map tour IDs to state keys
        const tourStateKeys: Record<string, keyof TourState> = {
          'onboarding': 'hasSeenOnboarding',
          'library': 'hasSeenLibraryTour',
          'player': 'hasSeenPlayerTour',
          'settings': 'hasSeenSettingsTour',
        };

        const completionKey = tourStateKeys[tourId];
        if (!completionKey) {
          console.error('[Tour] Unknown tour ID:', tourId);
          return;
        }

        // Update state
        set({
          [completionKey]: true,
          activeTour: null,
          runTour: false,
          tourStepIndex: 0,
        });

        console.log('[Tour] State updated, new state:', useTourStore.getState());

        // Sync to Firebase after state update
        setTimeout(async () => {
          const currentState = useTourStore.getState();
          const user = getCurrentUser();
          console.log('[Tour] Syncing to Firebase:', { user: user?.uid, state: currentState });
          if (user) {
            try {
              await syncTourStateToFirebase(user, {
                hasSeenOnboarding: currentState.hasSeenOnboarding,
                hasSeenLibraryTour: currentState.hasSeenLibraryTour,
                hasSeenPlayerTour: currentState.hasSeenPlayerTour,
                hasSeenSettingsTour: currentState.hasSeenSettingsTour,
              });
              console.log('[Tour] ✓ Successfully synced to Firebase');
            } catch (error) {
              console.error('[Tour] ✗ Failed to sync to Firebase:', error);
            }
          } else {
            console.warn('[Tour] No user found, cannot sync to Firebase');
          }
        }, 100);
      },

      skipTour: (tourId: string) => {
        console.log('[Tour] Skipped:', tourId);

        // Map tour IDs to state keys
        const tourStateKeys: Record<string, keyof TourState> = {
          'onboarding': 'hasSeenOnboarding',
          'library': 'hasSeenLibraryTour',
          'player': 'hasSeenPlayerTour',
          'settings': 'hasSeenSettingsTour',
        };

        const completionKey = tourStateKeys[tourId];
        if (!completionKey) {
          console.error('[Tour] Unknown tour ID:', tourId);
          return;
        }

        // Update state and get latest for Firebase sync
        const newState = {
          [completionKey]: true,
          activeTour: null,
          runTour: false,
          tourStepIndex: 0,
        };
        set(newState);

        // Sync to Firebase after state update
        setTimeout(() => {
          const currentState = useTourStore.getState();
          const user = getCurrentUser();
          if (user) {
            syncTourStateToFirebase(user, {
              hasSeenOnboarding: currentState.hasSeenOnboarding,
              hasSeenLibraryTour: currentState.hasSeenLibraryTour,
              hasSeenPlayerTour: currentState.hasSeenPlayerTour,
              hasSeenSettingsTour: currentState.hasSeenSettingsTour,
            });
          }
        }, 0);
      },

      resetAllTours: () => {
        console.log('[Tour] Resetting all tours');
        set({
          hasSeenOnboarding: false,
          hasSeenLibraryTour: false,
          hasSeenPlayerTour: false,
          hasSeenSettingsTour: false,
          activeTour: null,
          runTour: false,
          tourStepIndex: 0,
        });

        // Sync to Firebase
        setTimeout(() => {
          const user = getCurrentUser();
          if (user) {
            syncTourStateToFirebase(user, {
              hasSeenOnboarding: false,
              hasSeenLibraryTour: false,
              hasSeenPlayerTour: false,
              hasSeenSettingsTour: false,
            });
          }
        }, 0);
      },

      setStepIndex: (index: number) => set({ tourStepIndex: index }),

      stopTour: () => set({
        activeTour: null,
        runTour: false,
        tourStepIndex: 0,
      }),
    }),
    {
      name: 'spinerr-tours',
      version: 1,
      // Only persist completion state, not runtime state (activeTour, runTour, tourStepIndex)
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        hasSeenLibraryTour: state.hasSeenLibraryTour,
        hasSeenPlayerTour: state.hasSeenPlayerTour,
        hasSeenSettingsTour: state.hasSeenSettingsTour,
      }),
    }
  )
);
