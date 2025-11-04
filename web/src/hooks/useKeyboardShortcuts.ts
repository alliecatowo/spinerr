import { useEffect } from 'react';
import { usePlayerStore } from '@/lib/store';

/**
 * Custom hook for keyboard controls
 *
 * Keyboard shortcuts:
 * - Space bar: toggle play/pause
 * - Arrow Right: skip forward 5 seconds
 * - Arrow Left: skip backward 5 seconds
 * - Arrow Up: volume up 10%
 * - Arrow Down: volume down 10%
 * - N: next track
 * - P: previous track
 * - M: mute/unmute
 * - 0-9: seek to percentage (0=0%, 5=50%, 9=90%)
 *
 * Only activates when not typing in input fields
 */
export function useKeyboardShortcuts(): void {
  const {
    isPlaying,
    currentTrack,
    progress,
    volume,
    play,
    pause,
    updateProgress,
    setVolume,
    nextTrack,
    prevTrack,
  } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't activate shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInputField) {
        return;
      }

      const key = event.key;
      let handled = false;

      switch (key) {
        case ' ': {
          // Space bar: toggle play/pause
          event.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          handled = true;
          break;
        }

        case 'ArrowRight': {
          // Arrow Right: skip forward 5 seconds
          event.preventDefault();
          if (currentTrack) {
            const secondsToSkip = 5;
            const progressIncrement = secondsToSkip / currentTrack.duration;
            updateProgress(Math.min(1, progress + progressIncrement));
          }
          handled = true;
          break;
        }

        case 'ArrowLeft': {
          // Arrow Left: skip backward 5 seconds
          event.preventDefault();
          if (currentTrack) {
            const secondsToSkip = 5;
            const progressDecrement = secondsToSkip / currentTrack.duration;
            updateProgress(Math.max(0, progress - progressDecrement));
          }
          handled = true;
          break;
        }

        case 'ArrowUp': {
          // Arrow Up: volume up 10%
          event.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          handled = true;
          break;
        }

        case 'ArrowDown': {
          // Arrow Down: volume down 10%
          event.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          handled = true;
          break;
        }

        case 'n':
        case 'N': {
          // N: next track
          event.preventDefault();
          nextTrack();
          handled = true;
          break;
        }

        case 'p':
        case 'P': {
          // P: previous track
          event.preventDefault();
          prevTrack();
          handled = true;
          break;
        }

        case 'm':
        case 'M': {
          // M: mute/unmute
          event.preventDefault();
          if (volume > 0) {
            // Store current volume in a way that can be restored
            // For simplicity, we'll just toggle between current volume and 0
            // A more complex implementation could store the previous volume
            setVolume(0);
          } else {
            // Restore to a default volume if muted
            setVolume(0.7);
          }
          handled = true;
          break;
        }

        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          // 0-9: seek to percentage
          event.preventDefault();
          if (currentTrack) {
            const percentage = parseInt(key) / 10;
            updateProgress(percentage);
          }
          handled = true;
          break;
        }
      }

      // Only prevent default if we handled the key
      if (handled) {
        event.stopPropagation();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isPlaying,
    currentTrack,
    progress,
    volume,
    play,
    pause,
    updateProgress,
    setVolume,
    nextTrack,
    prevTrack,
  ]);
}
