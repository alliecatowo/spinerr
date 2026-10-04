import { useEffect, useRef } from 'react';
import { useTourStore, usePlayerStore } from '@/lib/store';

/**
 * Hook to auto-start onboarding tour on first visit
 * Only triggers ONCE per session when content is available
 */
export function useFirstVisit() {
  const hasSeenOnboarding = useTourStore((state) => state.hasSeenOnboarding);
  const runTour = useTourStore((state) => state.runTour);
  const startTour = useTourStore((state) => state.startTour);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only check once per session
    if (hasCheckedRef.current) return;

    // Wait until music is actually playing: while autoplay is blocked the
    // "Tap to play" prompt must stay reachable, and the tour's overlay would
    // cover it. Phones skip the auto-start (the Help button still offers it).
    const isPhone = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    if (isPhone) return;

    // If never seen AND not running AND have content, start tour after delay
    if (!hasSeenOnboarding && !runTour && currentTrack && isPlaying) {
      hasCheckedRef.current = true;
      const timer = setTimeout(() => {
        startTour('onboarding');
      }, 3000); // let the record settle first

      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding, runTour, currentTrack, isPlaying, startTour]);
}
