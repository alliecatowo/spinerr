import type { Track } from '../providers/types';
import { searchAudius } from './audius';
import { searchRadio } from './radio';
import { searchArchive } from './archive';
import { searchSoundCloud } from './soundcloud';
import { rankAndDedupe } from './rank';
import { setTrackHint } from './registry';

export interface SourceStatus {
  source: string;
  ok: boolean;
  count: number;
}

export interface UnifiedResults {
  tracks: Track[];
  statuses: SourceStatus[];
}

type SourceSearch = (query: string, limit: number, signal?: AbortSignal) => Promise<Track[]>;

const SOURCES: { id: string; search: SourceSearch }[] = [
  { id: 'audius', search: searchAudius },
  { id: 'soundcloud', search: searchSoundCloud },
  { id: 'archive', search: searchArchive },
  { id: 'radio', search: searchRadio },
];

export function registerSource(id: string, search: SourceSearch): void {
  if (!SOURCES.some((s) => s.id === id)) SOURCES.push({ id, search });
}

/**
 * Search every source at once. A source that fails or is slow is dropped
 * silently (it only shows up in `statuses`); the others still answer.
 */
export async function unifiedSearch(query: string, signal?: AbortSignal): Promise<UnifiedResults> {
  const settled = await Promise.allSettled(SOURCES.map((s) => s.search(query, 15, signal)));
  const statuses: SourceStatus[] = [];
  const all: Track[] = [];
  settled.forEach((result, i) => {
    const source = SOURCES[i].id;
    if (result.status === 'fulfilled') {
      statuses.push({ source, ok: true, count: result.value.length });
      all.push(...result.value);
    } else {
      statuses.push({ source, ok: false, count: 0 });
    }
  });

  const tracks = rankAndDedupe(all, query).map(({ track, alternates }) => {
    if (alternates.length > 0) setTrackHint(track.id, { alternates });
    return track;
  });
  return { tracks, statuses };
}
