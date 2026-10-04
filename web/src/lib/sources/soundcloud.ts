import type { Track } from '../providers/types';
import { fetchJson } from './fetch';
import { setTrackHint } from './registry';
import type { ResolvedSource } from './resolve';

export const SOUNDCLOUD_PREFIX = 'sc-';

interface ScTrack {
  id: number;
  title: string;
  artist: string;
  artworkUrl?: string;
  duration: number;
  permalinkUrl?: string;
  genre?: string;
  playbackCount?: number;
}

/** Search through the Cloud Function proxy (same origin via Hosting rewrite). */
export async function searchSoundCloud(query: string, limit = 15, signal?: AbortSignal): Promise<Track[]> {
  const { tracks } = await fetchJson<{ tracks: ScTrack[] }>(
    `/api/soundcloud/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    7000,
    signal,
  );
  return tracks.map((t) => {
    const id = `${SOUNDCLOUD_PREFIX}${t.id}`;
    // The CDN's CORS support has varied, so play it outside the analyser graph.
    setTrackHint(id, { cors: false });
    return {
      id,
      provider: 'soundcloud' as const,
      title: t.title,
      artist: t.artist,
      artworkUrl: t.artworkUrl,
      duration: t.duration,
      externalUrl: t.permalinkUrl,
      metadata: { genre: t.genre, popularity: t.playbackCount ?? 0 },
    };
  });
}

/** Handles new `sc-` ids and legacy `soundcloud-` ids saved by older versions. */
export async function resolveSoundCloud(id: string): Promise<ResolvedSource> {
  const numeric = id.replace(/^(sc-|soundcloud-)/, '');
  const { streamUrl } = await fetchJson<{ streamUrl: string }>(
    `/api/soundcloud/stream?trackId=${encodeURIComponent(numeric)}`,
    8000,
  );
  if (!streamUrl) throw new Error('No stream available for this SoundCloud track.');
  return { url: streamUrl, cors: false };
}
