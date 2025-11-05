import { useEffect, useRef } from 'react';
import { useTourStore } from '@/lib/store';

/**
 * Hook to detect first visit and auto-start onboarding tour
 * Waits for animations to settle before triggering
 * Only triggers ONCE per session, even on hard reloads
 */
export function useFirstVisit() {
  const hasSeenOnboarding = useTourStore((state) => state.hasSeenOnboarding);
  const startTour = useTourStore((state) => state.startTour);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Prevent triggering multiple times in same session
    if (hasTriggeredRef.current || hasSeenOnboarding) {
      return;
    }

    // Wait for initial render and animations to settle
    const timer = setTimeout(() => {
      if (!hasSeenOnboarding && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        console.log('[useFirstVisit] First visit detected, starting onboarding tour');
        startTour('onboarding');
      }
    }, 2000); // 2 second delay to let animations and data load

    return () => clearTimeout(timer);
  }, []); // Run only once on mount
}
