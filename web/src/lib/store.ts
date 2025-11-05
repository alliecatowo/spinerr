import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Album, Track as ProviderTrack, PlaylistRecord, UserLibrary } from './providers/types';

// Types
export type ViewMode = 'music' | 'both' | 'calendar';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
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
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: 0.7,
  playlist: [],

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  setTrack: (track: Track) => set({
    currentTrack: track,
    isPlaying: false, // Don't auto-play
    progress: 0
  }),

  updateProgress: (progress: number) => set({
    progress: Math.max(0, Math.min(1, progress))
  }),

  setVolume: (volume: number) => set({
    volume: Math.max(0, Math.min(1, volume))
  }),

  nextTrack: () => {
    const { currentTrack, playlist, isPlaying } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;

    set({
      currentTrack: playlist[nextIndex],
      isPlaying, // Keep current playing state
      progress: 0
    });
  },

  prevTrack: () => {
    const { currentTrack, playlist, isPlaying } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;

    set({
      currentTrack: playlist[prevIndex],
      isPlaying, // Keep current playing state
      progress: 0
    });
  },

  setPlaylist: (playlist: Track[]) => set({ playlist }),
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
