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

export type ViewMode = 'music' | 'calendar' | 'both';

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
    isPlaying: true,
    progress: 0
  }),

  updateProgress: (progress: number) => set({
    progress: Math.max(0, Math.min(1, progress))
  }),

  setVolume: (volume: number) => set({
    volume: Math.max(0, Math.min(1, volume))
  }),

  nextTrack: () => {
    const { currentTrack, playlist } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;

    set({
      currentTrack: playlist[nextIndex],
      isPlaying: true,
      progress: 0
    });
  },

  prevTrack: () => {
    const { currentTrack, playlist } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;

    set({
      currentTrack: playlist[prevIndex],
      isPlaying: true,
      progress: 0
    });
  },

  setPlaylist: (playlist: Track[]) => set({ playlist }),
}));

// Calendar Store
interface CalendarState {
  selectedDate: Date;
  events: CalendarEvent[];
  viewMode: ViewMode;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  selectDate: (date: Date) => void;
  addEvent: (event: CalendarEvent) => void;
  removeEvent: (eventId: string) => void;
  setEvents: (events: CalendarEvent[]) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  events: [],
  viewMode: 'both',

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  selectDate: (date: Date) => set({ selectedDate: date }),

  addEvent: (event: CalendarEvent) => set((state) => ({
    events: [...state.events, event]
  })),

  removeEvent: (eventId: string) => set((state) => ({
    events: state.events.filter(event => event.id !== eventId)
  })),

  setEvents: (events: CalendarEvent[]) => set({ events }),
}));
