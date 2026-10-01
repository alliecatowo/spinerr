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
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only check once per session
    if (hasCheckedRef.current) return;

    // If never seen AND not running AND have content, start tour after delay
    if (!hasSeenOnboarding && !runTour && currentTrack) {
      hasCheckedRef.current = true;
      const timer = setTimeout(() => {
        console.log('[useFirstVisit] Starting onboarding tour');
        startTour('onboarding');
      }, 2000); // 2 second delay for animations

      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding, runTour, currentTrack, startTour]);
}
