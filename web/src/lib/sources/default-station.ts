import type { Album, Track } from '../providers/types';
import { trendingAudius } from './audius';
import bundled from './default-tracks.json';

export const DEFAULT_STATION_ID = 'station-spinerr-radio';

interface BundledTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  artworkUrl: string;
}

function fromBundled(): Track[] {
  return (bundled as BundledTrack[]).map((t) => ({
    id: `audius-${t.id}`,
    provider: 'audius' as const,
    title: t.title,
    artist: t.artist,
    artworkUrl: t.artworkUrl,
    duration: t.duration,
  }));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * The record that spins on first landing: fresh trending lo-fi from Audius when
 * the API answers quickly, otherwise a bundled list of verified tracks, so
 * landing never waits on (or breaks because of) a network call.
 */
export async function loadDefaultStation(): Promise<Album> {
  let tracks: Track[] = [];
  try {
    tracks = (await trendingAudius('Lo-Fi', 40)).filter((t) => t.duration >= 90 && t.duration <= 420 && t.artworkUrl);
  } catch {
    tracks = [];
  }
  if (tracks.length < 6) tracks = fromBundled();
  const queue = shuffle(tracks).slice(0, 15);
  return {
    id: DEFAULT_STATION_ID,
    provider: 'audius',
    title: 'Spinnerr Radio',
    artist: 'Trending lo-fi on Audius',
    artworkUrl: queue[0]?.artworkUrl,
    trackCount: queue.length,
    tracks: queue,
    duration: queue.reduce((sum, t) => sum + t.duration, 0),
  };
}
