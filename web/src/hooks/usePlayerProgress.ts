import { useEffect } from 'react';
import { usePlayerStore } from '@/lib/store';

/**
 * Custom hook for player progress integration with HTML5 audio
 *
 * Features:
 * - Progress updates are handled by AudioPlayer's timeupdate event
 * - This hook ensures audio player is initialized when component mounts
 * - Track changes are handled by the store and audio player integration
 *
 * @returns current progress (0-1)
 */
export function usePlayerProgress(): number {
  const { progress, currentTrack } = usePlayerStore();

  useEffect(() => {
    // Initialize audio player on mount (client-side only)
    if (typeof window !== 'undefined') {
      import('@/lib/audio-player').then(({ getAudioPlayer }) => {
        const audioPlayer = getAudioPlayer();
        audioPlayer.initialize();
      });
    }
  }, []);

  // Note: Progress updates and track advancement are now handled by:
  // - AudioPlayer's timeupdate event listener (progress updates)
  // - AudioPlayer's ended event listener (auto-advance to next track)
  // This eliminates the need for interval-based progress simulation

  return progress;
}
