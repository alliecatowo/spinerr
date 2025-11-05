/**
 * HTML5 Audio Player Singleton
 * Manages audio playback for SoundCloud streams with store integration
 */

import { usePlayerStore } from './store';

export class AudioPlayer {
  private static instance: AudioPlayer | null = null;
  private audio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private isInitialized = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  /**
   * Initialize audio player (client-side only)
   */
  initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.audio = new Audio();
    this.audio.preload = 'auto';

    // Set initial volume from store
    const volume = usePlayerStore.getState().volume;
    this.audio.volume = volume;

    // Listen for time updates to sync progress
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);

    // Listen for track end to auto-advance
    this.audio.addEventListener('ended', this.handleTrackEnded);

    // Listen for errors
    this.audio.addEventListener('error', this.handleError);

    // Listen for loading events
    this.audio.addEventListener('canplay', this.handleCanPlay);
    this.audio.addEventListener('waiting', this.handleWaiting);

    this.isInitialized = true;
  }

  /**
   * Load and play a track by ID
   */
  async loadTrack(trackId: string): Promise<void> {
    if (!this.audio) {
      this.initialize();
    }

    if (!this.audio) {
      console.error('Audio player not initialized');
      return;
    }

    try {
      // Don't reload if it's the same track
      if (this.currentTrackId === trackId) {
        return;
      }

      // Fetch stream URL from API
      const response = await fetch(`/api/soundcloud/stream?trackId=${trackId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stream URL');
      }

      const data = await response.json();
      if (!data.streamUrl) {
        throw new Error('No stream URL available');
      }

      // Load new audio source
      this.audio.src = data.streamUrl;
      this.currentTrackId = trackId;

      // Reset progress in store
      usePlayerStore.getState().updateProgress(0);

      // Start loading the audio
      await this.audio.load();
    } catch (error) {
      console.error('Error loading track:', error);
      usePlayerStore.getState().pause();
    }
  }

  /**
   * Play current track
   */
  async play(): Promise<void> {
    if (!this.audio) {
      this.initialize();
    }

    if (!this.audio) {
      console.error('Audio player not initialized');
      return;
    }

    try {
      await this.audio.play();
      usePlayerStore.getState().play();
    } catch (error) {
      console.error('Error playing track:', error);
      usePlayerStore.getState().pause();
    }
  }

  /**
   * Pause current track
   */
  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
    usePlayerStore.getState().pause();
  }

  /**
   * Seek to position (0-1)
   */
  seek(progress: number): void {
    if (!this.audio) return;
    const time = progress * this.audio.duration;
    if (!isNaN(time)) {
      this.audio.currentTime = time;
      usePlayerStore.getState().updateProgress(progress);
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (!this.audio) return;
    this.audio.volume = Math.max(0, Math.min(1, volume));
    usePlayerStore.getState().setVolume(volume);
  }

  /**
   * Stop playback and clear current track
   */
  stop(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTrackId = null;
    usePlayerStore.getState().pause();
    usePlayerStore.getState().updateProgress(0);
  }

  /**
   * Get current playback state
   */
  getState() {
    if (!this.audio) {
      return {
        currentTime: 0,
        duration: 0,
        paused: true,
        volume: 0.7,
      };
    }

    return {
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      paused: this.audio.paused,
      volume: this.audio.volume,
    };
  }

  /**
   * Handle time update event
   */
  private handleTimeUpdate = () => {
    if (!this.audio) return;

    const duration = this.audio.duration || 0;
    if (duration > 0) {
      const progress = this.audio.currentTime / duration;
      usePlayerStore.getState().updateProgress(progress);
    }
  };

  /**
   * Handle track ended event
   */
  private handleTrackEnded = () => {
    console.log('Track ended, advancing to next track');
    usePlayerStore.getState().updateProgress(1);
    usePlayerStore.getState().nextTrack();
  };

  /**
   * Handle error event
   */
  private handleError = (event: Event) => {
    console.error('Audio playback error:', event);
    usePlayerStore.getState().pause();
  };

  /**
   * Handle can play event
   */
  private handleCanPlay = () => {
    console.log('Audio ready to play');
  };

  /**
   * Handle waiting/buffering event
   */
  private handleWaiting = () => {
    console.log('Audio buffering...');
  };

  /**
   * Clean up resources
   */
  destroy(): void {
    if (!this.audio) return;

    this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.removeEventListener('ended', this.handleTrackEnded);
    this.audio.removeEventListener('error', this.handleError);
    this.audio.removeEventListener('canplay', this.handleCanPlay);
    this.audio.removeEventListener('waiting', this.handleWaiting);

    this.audio.pause();
    this.audio.src = '';
    this.audio = null;
    this.currentTrackId = null;
    this.isInitialized = false;
  }
}

// Export singleton instance getter
export const getAudioPlayer = () => AudioPlayer.getInstance();
