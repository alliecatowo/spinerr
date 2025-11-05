import type { Step } from 'react-joyride';

export const onboardingSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h2 className="text-xl font-bold mb-2">Welcome to Spinerr 🎵</h2>
        <p>A zen music player with beautiful generative vinyl visualizations. Let's take a quick tour!</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
    styles: {
      options: {
        width: 400,
      },
    },
  },
  {
    target: '[data-tour="vinyl-disc"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Vinyl Visualizer</h3>
        <p>Click the vinyl to play/pause. Watch the generative art respond to your music in real-time.</p>
      </div>
    ),
    placement: 'right',
    spotlightClicks: true,
  },
  {
    target: '[data-tour="player-controls"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Player Controls</h3>
        <p>Control playback here, or use keyboard shortcuts:</p>
        <ul className="mt-2 text-sm space-y-1 opacity-80">
          <li>• <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-neutral-700 rounded text-xs">Space</kbd> - Play/Pause</li>
          <li>• <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-neutral-700 rounded text-xs">N</kbd> - Next track</li>
          <li>• <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-neutral-700 rounded text-xs">P</kbd> - Previous track</li>
        </ul>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="navigation"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Navigation</h3>
        <p>Access your library and settings from here. Add albums from SoundCloud to get started!</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="sidebar"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Your Queue</h3>
        <p>See your currently playing album's tracks here. Click any track to jump to it.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="info-toggle"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Info Panel</h3>
        <p>Toggle the calendar and upcoming events panel for a distraction-free experience.</p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '[data-tour="theme-toggle"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Theme Toggle</h3>
        <p>Switch between light and dark themes. The vinyl art adapts beautifully to both!</p>
      </div>
    ),
    placement: 'right',
  },
];
