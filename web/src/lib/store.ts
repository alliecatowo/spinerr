import { create } from 'zustand';

// Types
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverColor: string; // hex color
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
