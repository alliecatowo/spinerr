import type { Album, Track } from './providers/types';

/**
 * Mock Albums for Development
 * Sample album-focused data demonstrating the library structure
 */

// Mock Album 1: Random Access Memories - Daft Punk
const randomAccessMemoriesTracks: Track[] = [
  {
    id: 'ram-1',
    provider: 'local',
    title: 'Give Life Back to Music',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 274,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
  },
  {
    id: 'ram-2',
    provider: 'local',
    title: 'The Game of Love',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 321,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
  },
  {
    id: 'ram-3',
    provider: 'local',
    title: 'Giorgio by Moroder',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 544,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
  },
  {
    id: 'ram-4',
    provider: 'local',
    title: 'Within',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 228,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
  },
  {
    id: 'ram-5',
    provider: 'local',
    title: 'Instant Crush',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 337,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
  },
  {
    id: 'ram-6',
    provider: 'local',
    title: 'Lose Yourself to Dance',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 353,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
  },
  {
    id: 'ram-7',
    provider: 'local',
    title: 'Touch',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 498,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
  },
  {
    id: 'ram-8',
    provider: 'local',
    title: 'Get Lucky',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 367,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
  },
];

// Mock Album 2: In Rainbows - Radiohead
const inRainbowsTracks: Track[] = [
  {
    id: 'ir-1',
    provider: 'local',
    title: '15 Step',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 237,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-2',
    provider: 'local',
    title: 'Bodysnatchers',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 242,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-3',
    provider: 'local',
    title: 'Nude',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 253,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-4',
    provider: 'local',
    title: 'Weird Fishes/Arpeggi',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 318,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-5',
    provider: 'local',
    title: 'All I Need',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 228,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-6',
    provider: 'local',
    title: 'Faust Arp',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 130,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-7',
    provider: 'local',
    title: 'Reckoner',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 290,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-8',
    provider: 'local',
    title: 'House of Cards',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 323,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-9',
    provider: 'local',
    title: 'Jigsaw Falling Into Place',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 249,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
  {
    id: 'ir-10',
    provider: 'local',
    title: 'Videotape',
    artist: 'Radiohead',
    album: 'In Rainbows',
    duration: 284,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
  },
];

// Mock Album 3: Rumours - Fleetwood Mac
const rumoursTracks: Track[] = [
  {
    id: 'rum-1',
    provider: 'local',
    title: 'Second Hand News',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 163,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-2',
    provider: 'local',
    title: 'Dreams',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 257,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-3',
    provider: 'local',
    title: "Never Going Back Again",
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 132,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-4',
    provider: 'local',
    title: "Don't Stop",
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 191,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-5',
    provider: 'local',
    title: 'Go Your Own Way',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 218,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-6',
    provider: 'local',
    title: 'Songbird',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 200,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-7',
    provider: 'local',
    title: 'The Chain',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 270,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-8',
    provider: 'local',
    title: "You Make Loving Fun",
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 211,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-9',
    provider: 'local',
    title: 'I Don\'t Want to Know',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 194,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-10',
    provider: 'local',
    title: 'Oh Daddy',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 234,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
  {
    id: 'rum-11',
    provider: 'local',
    title: 'Gold Dust Woman',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    duration: 295,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
  },
];

// Mock Album 4: Discovery - Daft Punk
const discoveryTracks: Track[] = [
  {
    id: 'dis-1',
    provider: 'local',
    title: 'One More Time',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 320,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-2',
    provider: 'local',
    title: 'Aerodynamic',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 212,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-3',
    provider: 'local',
    title: 'Digital Love',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 297,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-4',
    provider: 'local',
    title: 'Harder, Better, Faster, Stronger',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 224,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-5',
    provider: 'local',
    title: 'Crescendolls',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 209,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-6',
    provider: 'local',
    title: 'Nightvision',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 104,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-7',
    provider: 'local',
    title: 'Superheroes',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 237,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-8',
    provider: 'local',
    title: 'High Life',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 202,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-9',
    provider: 'local',
    title: 'Something About Us',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 232,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-10',
    provider: 'local',
    title: 'Voyager',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 227,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-11',
    provider: 'local',
    title: 'Veridis Quo',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 345,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-12',
    provider: 'local',
    title: 'Short Circuit',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 206,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-13',
    provider: 'local',
    title: 'Face to Face',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 238,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
  {
    id: 'dis-14',
    provider: 'local',
    title: 'Too Long',
    artist: 'Daft Punk',
    album: 'Discovery',
    duration: 600,
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
  },
];

// Calculate total duration helper
const calculateDuration = (tracks: Track[]): number => {
  return tracks.reduce((sum, track) => sum + track.duration, 0);
};

// Export mock albums
export const mockAlbums: Album[] = [
  {
    id: 'album-ram',
    provider: 'local',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273f8f028d52cc15518f7b01fcf',
    year: 2013,
    trackCount: randomAccessMemoriesTracks.length,
    tracks: randomAccessMemoriesTracks,
    duration: calculateDuration(randomAccessMemoriesTracks),
  },
  {
    id: 'album-ir',
    provider: 'local',
    title: 'In Rainbows',
    artist: 'Radiohead',
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318',
    year: 2007,
    trackCount: inRainbowsTracks.length,
    tracks: inRainbowsTracks,
    duration: calculateDuration(inRainbowsTracks),
  },
  {
    id: 'album-rum',
    provider: 'local',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
    year: 1977,
    trackCount: rumoursTracks.length,
    tracks: rumoursTracks,
    duration: calculateDuration(rumoursTracks),
  },
  {
    id: 'album-dis',
    provider: 'local',
    title: 'Discovery',
    artist: 'Daft Punk',
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273cf2b5acfa4f3cc1a8bf41c5a',
    year: 2001,
    trackCount: discoveryTracks.length,
    tracks: discoveryTracks,
    duration: calculateDuration(discoveryTracks),
  },
];

// Export a function to get a specific album by ID
export const getMockAlbumById = (id: string): Album | undefined => {
  return mockAlbums.find(album => album.id === id);
};

// Export a function to get all tracks from all mock albums
export const getAllMockTracks = (): Track[] => {
  return mockAlbums.flatMap(album => album.tracks);
};

// Export a function to get random tracks (useful for playlist creation)
export const getRandomTracks = (count: number): Track[] => {
  const allTracks = getAllMockTracks();
  const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allTracks.length));
};
