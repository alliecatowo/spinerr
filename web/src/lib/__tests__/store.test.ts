import { beforeEach, describe, expect, it } from 'vitest';
import { type CalendarEvent, type Track, useCalendarStore, usePlayerStore } from '../store';

const track = (id: string): Track => ({
  id,
  title: `Track ${id}`,
  artist: 'Artist',
  album: 'Album',
  duration: 180,
  coverColor: '#223344',
});

const playlist = [track('a'), track('b'), track('c')];

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      playlist: [],
      playbackError: null,
    });
  });

  it('setTrack selects without auto-playing and resets progress', () => {
    usePlayerStore.setState({ progress: 0.8, isPlaying: true });
    usePlayerStore.getState().setTrack(playlist[0]);
    const state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe('a');
    expect(state.isPlaying).toBe(false);
    expect(state.progress).toBe(0);
  });

  it('clamps progress and volume to 0..1', () => {
    const { updateProgress, setVolume } = usePlayerStore.getState();
    updateProgress(5);
    expect(usePlayerStore.getState().progress).toBe(1);
    updateProgress(-1);
    expect(usePlayerStore.getState().progress).toBe(0);
    setVolume(2);
    expect(usePlayerStore.getState().volume).toBe(1);
    setVolume(-2);
    expect(usePlayerStore.getState().volume).toBe(0);
  });

  it('nextTrack and prevTrack wrap around the playlist', () => {
    usePlayerStore.setState({ playlist, currentTrack: playlist[2] });
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrack?.id).toBe('a');
    usePlayerStore.getState().prevTrack();
    expect(usePlayerStore.getState().currentTrack?.id).toBe('c');
  });

  it('does nothing without a current track', () => {
    usePlayerStore.setState({ playlist });
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrack).toBeNull();
  });
});

describe('useCalendarStore', () => {
  it('adds and removes events', () => {
    const event: CalendarEvent = {
      id: 'e1',
      title: 'Standup',
      date: new Date('2026-10-05T09:00:00Z'),
      time: '09:00',
      type: 'meeting',
      description: '',
    };
    useCalendarStore.setState({ events: [] });
    useCalendarStore.getState().addEvent(event);
    expect(useCalendarStore.getState().events).toHaveLength(1);
    useCalendarStore.getState().removeEvent('e1');
    expect(useCalendarStore.getState().events).toHaveLength(0);
  });
});
