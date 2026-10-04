/**
 * Audio player singleton.
 *
 * Two <audio> elements share one set of controls:
 *  - `cors`  : crossOrigin="anonymous", routed through the Web Audio analyser
 *              so the vinyl reacts to the real signal (Audius, Internet Archive, local files).
 *  - `plain` : no CORS, not in the audio graph (internet radio, proxied streams).
 *              Such a host would otherwise play silence or fail to load, so the
 *              visualizer uses a synthetic signal for these.
 *
 * Failures never dead-end the listener: a track that errors, or stalls before
 * it can play, silently falls back to an equivalent copy on another source and
 * then to the next track in the queue.
 */

import { usePlayerStore } from './store';
import { getAudioAnalyzer } from './audio-analyzer';
import { resolveTrackSource } from './sources/resolve';
import { getTrackHint } from './sources/registry';

const STALL_TIMEOUT_MS = 12000;
const MAX_CONSECUTIVE_FAILURES = 5;
// A fresh track starts only once this many seconds are buffered ahead (or the
// wait times out). Starting on a thin buffer is what made first play stutter
// until the listener paused and resumed.
const PREBUFFER_SECONDS = 6;
const PREBUFFER_TIMEOUT_MS = 3500;

function bufferedAhead(el: HTMLAudioElement): number {
  const t = el.currentTime;
  for (let i = 0; i < el.buffered.length; i++) {
    if (el.buffered.start(i) <= t + 0.25 && el.buffered.end(i) >= t) return el.buffered.end(i) - t;
  }
  return 0;
}

type Kind = 'cors' | 'plain';

export class AudioPlayer {
  private static instance: AudioPlayer | null = null;
  private elements: Partial<Record<Kind, HTMLAudioElement>> = {};
  private active: Kind = 'cors';
  private currentTrackId: string | null = null;
  private isInitialized = false;
  private stallTimer: ReturnType<typeof setTimeout> | null = null;
  private failures = 0;
  private triedAlternates = new Set<string>();

  private constructor() {}

  static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) AudioPlayer.instance = new AudioPlayer();
    return AudioPlayer.instance;
  }

  private get audio(): HTMLAudioElement | null {
    return this.elements[this.active] ?? null;
  }

  private createElement(kind: Kind): HTMLAudioElement {
    const el = new Audio();
    el.preload = 'auto';
    if (kind === 'cors') el.crossOrigin = 'anonymous';
    el.volume = usePlayerStore.getState().volume;
    el.addEventListener('timeupdate', () => this.handleTimeUpdate(el));
    el.addEventListener('ended', this.handleTrackEnded);
    el.addEventListener('error', () => this.handleError(el));
    el.addEventListener('playing', this.handlePlaying);
    el.addEventListener('playing', () => this.prebufferGuard(el), { once: false });
    return el;
  }

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.elements.cors = this.createElement('cors');
    this.elements.plain = this.createElement('plain');
    this.isInitialized = true;
  }

  /** Connect the analyser the first time we are allowed to make sound. */
  private ensureAnalyser() {
    const cors = this.elements.cors;
    const analyzer = getAudioAnalyzer();
    if (!cors || analyzer.isConnected()) return;
    // Creating an AudioContext before any user gesture only logs a warning, so wait.
    if (typeof navigator !== 'undefined' && navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    analyzer.connect(cors);
  }

  async loadTrack(trackId: string): Promise<void> {
    if (!this.isInitialized) this.initialize();
    if (this.currentTrackId === trackId && this.audio?.src) return;

    this.clearStallTimer();
    try {
      const { url, cors } = await resolveTrackSource(trackId);
      const kind: Kind = cors ? 'cors' : 'plain';

      // Silence whichever element was playing before switching.
      this.audio?.pause();
      this.active = kind;
      getAudioAnalyzer().setSynthetic(kind === 'plain');

      const el = this.audio!;
      el.src = url;
      this.currentTrackId = trackId;
      this.guardedTrack = null;
      if (this.guardTimer) clearTimeout(this.guardTimer);
      this.guardTimer = null;
      usePlayerStore.getState().updateProgress(0);
      el.load();
      this.armStallTimer(trackId);
    } catch (error) {
      this.currentTrackId = null;
      usePlayerStore.getState().updateProgress(0);
      // Resolution failed (dead source): move on silently.
      if (await this.fallback(trackId)) return;
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.isInitialized) this.initialize();
    const el = this.audio;
    if (!el) return;
    this.ensureAnalyser();
    if (this.active === 'cors') await getAudioAnalyzer().resume().catch(() => undefined);
    await el.play();
  }

  pause(): void {
    this.audio?.pause();
  }

  seek(progress: number): void {
    const el = this.audio;
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return; // live streams cannot seek
    el.currentTime = progress * el.duration;
    usePlayerStore.getState().updateProgress(progress);
  }

  setVolume(volume: number): void {
    const v = Math.max(0, Math.min(1, volume));
    for (const el of Object.values(this.elements)) if (el) el.volume = v;
    usePlayerStore.getState().setVolume(v);
  }

  stop(): void {
    this.clearStallTimer();
    if (this.guardTimer) clearTimeout(this.guardTimer);
    this.guardTimer = null;
    for (const el of Object.values(this.elements)) el?.pause();
    if (this.audio) this.audio.currentTime = 0;
    this.currentTrackId = null;
    usePlayerStore.getState().pause();
    usePlayerStore.getState().updateProgress(0);
  }

  getState() {
    const el = this.audio;
    if (!el) return { currentTime: 0, duration: 0, paused: true, volume: 0.7 };
    return { currentTime: el.currentTime, duration: el.duration || 0, paused: el.paused, volume: el.volume };
  }

  // --- fallback -----------------------------------------------------------

  private armStallTimer(trackId: string) {
    this.stallTimer = setTimeout(() => {
      if (this.currentTrackId === trackId && usePlayerStore.getState().isPlaying) void this.fallback(trackId);
    }, STALL_TIMEOUT_MS);
  }

  private clearStallTimer() {
    if (this.stallTimer) clearTimeout(this.stallTimer);
    this.stallTimer = null;
  }

  /**
   * Try an equivalent copy of the failed track on another source, then skip to
   * the next track. Returns false when nothing is left to try.
   */
  private async fallback(failedId: string): Promise<boolean> {
    this.clearStallTimer();
    const store = usePlayerStore.getState();
    this.failures += 1;
    if (this.failures > MAX_CONSECUTIVE_FAILURES) return false;

    const alternates = getTrackHint(failedId)?.alternates ?? [];
    const next = alternates.find((t) => !this.triedAlternates.has(t.id));
    this.triedAlternates.add(failedId);
    if (next) {
      this.triedAlternates.add(next.id);
      try {
        await this.loadTrack(next.id);
        if (store.isPlaying) await this.play();
        return true;
      } catch {
        return this.fallback(next.id);
      }
    }
    if (store.playlist.length > 1) {
      store.nextTrack();
      return true;
    }
    return false;
  }

  // --- element events -----------------------------------------------------

  private handleTimeUpdate = (el: HTMLAudioElement) => {
    if (el !== this.audio) return;
    const duration = el.duration;
    if (Number.isFinite(duration) && duration > 0) {
      usePlayerStore.getState().updateProgress(el.currentTime / duration);
    }
  };

  private guardedTrack: string | null = null;
  private guardTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Playback just began on a track we have not guarded yet. If the buffer is
   * thin (cold connection, redirect still streaming in), hold playback for a
   * moment so it can fill, then resume. Runs after the user gesture, so it is
   * safe on browsers that demand a synchronous play() call.
   */
  private prebufferGuard(el: HTMLAudioElement) {
    const id = this.currentTrackId;
    if (el !== this.audio || !id || this.guardedTrack === id) return;
    this.guardedTrack = id;
    // Live streams and unknown-length sources have no meaningful "ahead".
    if (!Number.isFinite(el.duration) || el.duration <= PREBUFFER_SECONDS * 2) return;
    if (bufferedAhead(el) >= PREBUFFER_SECONDS) return;

    el.pause();
    const resume = () => {
      if (this.guardTimer) clearTimeout(this.guardTimer);
      this.guardTimer = null;
      el.removeEventListener('progress', check);
      // The listener may have paused or skipped meanwhile.
      if (el === this.audio && this.currentTrackId === id && usePlayerStore.getState().isPlaying) {
        void el.play().catch(() => undefined);
      }
    };
    const check = () => {
      if (bufferedAhead(el) >= PREBUFFER_SECONDS) resume();
    };
    el.addEventListener('progress', check);
    this.guardTimer = setTimeout(resume, PREBUFFER_TIMEOUT_MS);
  }

  private handlePlaying = () => {
    this.clearStallTimer();
    this.failures = 0;
    this.triedAlternates.clear();
  };

  private handleTrackEnded = () => {
    usePlayerStore.getState().updateProgress(1);
    usePlayerStore.getState().nextTrack();
  };

  private handleError = (el: HTMLAudioElement) => {
    if (el !== this.audio || !el.src || !this.currentTrackId) return;
    const id = this.currentTrackId;
    void this.fallback(id).then((recovered) => {
      if (!recovered) {
        const store = usePlayerStore.getState();
        store.pause();
        store.setPlaybackError("Couldn't play this track. Try another one or search for something else.");
      }
    });
  };

  destroy(): void {
    this.clearStallTimer();
    for (const el of Object.values(this.elements)) {
      el?.pause();
      if (el) el.src = '';
    }
    this.elements = {};
    this.currentTrackId = null;
    this.isInitialized = false;
  }
}

export const getAudioPlayer = () => AudioPlayer.getInstance();
