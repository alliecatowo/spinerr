import type { Track } from '../providers/types';
import { fetchJson } from './fetch';

const API = 'https://api.audius.co/v1';
const APP = 'app_name=spinerr';

interface AudiusTrack {
  id: string;
  title: string;
  duration: number;
  play_count?: number;
  genre?: string;
  is_streamable?: boolean;
  is_delete?: boolean;
  access?: { stream?: boolean };
  permalink?: string;
  artwork?: Record<string, string> | null;
  user?: { name?: string };
}

export const AUDIUS_PREFIX = 'audius-';

export function audiusStreamUrl(id: string): string {
  return `${API}/tracks/${encodeURIComponent(id)}/stream?${APP}`;
}

function playable(t: AudiusTrack): boolean {
  return !!t.id && !t.is_delete && t.is_streamable !== false && t.access?.stream !== false && t.duration > 0;
}

export function toTrack(t: AudiusTrack): Track {
  return {
    id: `${AUDIUS_PREFIX}${t.id}`,
    provider: 'audius',
    title: t.title,
    artist: t.user?.name || 'Unknown artist',
    artworkUrl: t.artwork?.['480x480'] || t.artwork?.['1000x1000'] || t.artwork?.['150x150'],
    duration: t.duration,
    externalUrl: t.permalink ? `https://audius.co${t.permalink}` : undefined,
    metadata: { genre: t.genre, popularity: t.play_count ?? 0 },
  };
}

export async function searchAudius(query: string, limit = 20, signal?: AbortSignal): Promise<Track[]> {
  const url = `${API}/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&${APP}`;
  const { data } = await fetchJson<{ data: AudiusTrack[] }>(url, 5000, signal);
  return data.filter(playable).map(toTrack);
}

/** Trending tracks, optionally for one genre (default station, Browse). */
export async function trendingAudius(
  genre: string,
  limit = 40,
  signal?: AbortSignal,
  timeoutMs = 2500,
): Promise<Track[]> {
  const g = genre ? `genre=${encodeURIComponent(genre)}&` : '';
  const url = `${API}/tracks/trending?${g}time=month&limit=${limit}&${APP}`;
  const { data } = await fetchJson<{ data: AudiusTrack[] }>(url, timeoutMs, signal);
  return data.filter(playable).map(toTrack);
}
