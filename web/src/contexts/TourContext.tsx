'use client';

import dynamic from 'next/dynamic';
import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useTourStore } from '@/lib/store';
import { getTourById } from '@/lib/tours/tour-config';
import type { CallBackProps, Step } from 'react-joyride';

// Dynamic import to avoid SSR issues
const JoyrideNoSSR = dynamic(() => import('react-joyride'), { ssr: false });

interface TourContextType {
  startTour: (tourId: string) => void;
  stopTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const {
    activeTour,
    tourStepIndex,
    runTour,
    startTour,
    completeTour,
    skipTour,
    stopTour,
    setStepIndex,
  } = useTourStore();

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, index, type } = data;

    if (status === 'finished' || status === 'skipped') {
      if (activeTour) {
        if (status === 'finished') {
          completeTour(activeTour);
        } else {
          skipTour(activeTour);
        }
      }
    }

    if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  }, [activeTour, completeTour, skipTour, setStepIndex]);

  // Get current tour steps
  const tourConfig = activeTour ? getTourById(activeTour) : null;
  const steps: Step[] = tourConfig?.steps || [];

  return (
    <TourContext.Provider value={{ startTour, stopTour }}>
      {children}
      {typeof window !== 'undefined' && (
        <JoyrideNoSSR
          steps={steps}
          run={runTour}
          stepIndex={tourStepIndex}
          callback={handleJoyrideCallback}
          continuous
          showProgress
          showSkipButton
          disableScrolling={false}
          styles={{
            options: {
              primaryColor: '#8b5cf6', // Purple to match app theme
              zIndex: 10000,
              textColor: '#1f2937',
              arrowColor: '#fff',
            },
            tooltip: {
              borderRadius: 12,
              padding: 20,
            },
            tooltipContainer: {
              textAlign: 'left',
            },
            tooltipContent: {
              padding: '8px 0',
            },
            buttonNext: {
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
            },
            buttonBack: {
              marginRight: 10,
              color: '#6b7280',
            },
            buttonSkip: {
              color: '#9ca3af',
            },
            spotlight: {
              borderRadius: 8,
            },
            overlay: {
              mixBlendMode: 'normal',
            },
          }}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
}
