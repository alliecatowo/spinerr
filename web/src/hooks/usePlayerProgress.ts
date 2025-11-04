import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/lib/store';

/**
 * Custom hook for auto-updating player progress
 *
 * Features:
 * - Auto-increments progress when playing (every 100ms for smooth animation)
 * - Calculates increment based on track duration
 * - Auto-advances to next track when progress reaches 1.0
 * - Cleans up interval on unmount
 *
 * @returns current progress (0-1)
 */
export function usePlayerProgress(): number {
  const { isPlaying, currentTrack, progress, updateProgress, nextTrack } = usePlayerStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start interval if playing and track exists
    if (!isPlaying || !currentTrack) {
      return;
    }

    // Calculate progress increment per 100ms
    // increment = (100ms / track_duration_in_ms) = (0.1s / duration_in_s)
    const increment = 0.1 / currentTrack.duration;

    intervalRef.current = setInterval(() => {
      const { progress: currentProgress, isPlaying: stillPlaying } = usePlayerStore.getState();

      // Double-check we're still playing
      if (!stillPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const newProgress = currentProgress + increment;

      // Check if track has finished
      if (newProgress >= 1.0) {
        updateProgress(1.0);
        // Auto-advance to next track
        nextTrack();
      } else {
        updateProgress(newProgress);
      }
    }, 100); // Update every 100ms for smooth animation

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, currentTrack, updateProgress, nextTrack]);

  return progress;
}
