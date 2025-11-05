import type { Step } from 'react-joyride';
import { onboardingSteps } from './steps/onboarding';
import { librarySteps } from './steps/library';

export interface TourConfig {
  id: string;
  name: string;
  description: string;
  steps: Step[];
}

export const tours: Record<string, TourConfig> = {
  onboarding: {
    id: 'onboarding',
    name: 'Welcome Tour',
    description: 'Get started with Spinerr',
    steps: onboardingSteps,
  },
  library: {
    id: 'library',
    name: 'Library Tour',
    description: 'Learn how to manage your music library',
    steps: librarySteps,
  },
};

export const getTourById = (tourId: string): TourConfig | undefined => {
  return tours[tourId];
};

export const getAllTours = (): TourConfig[] => {
  return Object.values(tours);
};
