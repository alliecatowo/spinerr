import type { Step } from 'react-joyride';

export const librarySteps: Step[] = [
  {
    target: '[data-tour="add-album"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Add Albums</h3>
        <p>Click here to search and add albums from SoundCloud to your library.</p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="grid-size"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Grid Size</h3>
        <p>Adjust the album grid size to your preference - from compact to large art-focused views.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="album-grid"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Your Albums</h3>
        <p>Your album collection. Click any album to start playing it immediately.</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="recently-played"]',
    content: (
      <div>
        <h3 className="font-semibold mb-1">Recently Played</h3>
        <p>Quick access to your recently played albums. Up to 10 albums are kept here.</p>
      </div>
    ),
    placement: 'top',
  },
];
