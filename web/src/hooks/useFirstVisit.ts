import { useEffect } from 'react';
import { useTourStore } from '@/lib/store';

/**
 * Hook to detect first visit and auto-start onboarding tour
 * Waits for animations to settle before triggering
 */
export function useFirstVisit() {
  const hasSeenOnboarding = useTourStore((state) => state.hasSeenOnboarding);
  const startTour = useTourStore((state) => state.startTour);

  useEffect(() => {
    // Wait for initial render and animations to settle
    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        console.log('[useFirstVisit] First visit detected, starting onboarding tour');
        startTour('onboarding');
      }
    }, 2000); // 2 second delay to let animations and data load

    return () => clearTimeout(timer);
  }, [hasSeenOnboarding, startTour]);
}
