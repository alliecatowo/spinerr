import type { Track } from '../providers/types';
import { fetchJson } from './fetch';
import { setTrackHint } from './registry';

export const RADIO_PREFIX = 'radio-';

// radio-browser.info is a pool of mirrors; try each until one answers.
const MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://fi1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
];

interface Station {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon?: string;
  tags?: string;
  votes?: number;
  hls?: number;
  codec?: string;
  country?: string;
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let lastError: unknown;
  for (const mirror of MIRRORS) {
    try {
      return await fetchJson<T>(`${mirror}${path}`, 4000, signal);
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError;
}

function toTrack(s: Station): Track | null {
  // https only: an http stream on our https site is blocked as mixed content.
  if (!s.url_resolved?.startsWith('https://') || s.hls) return null;
  const id = `${RADIO_PREFIX}${s.stationuuid}`;
  // Most radio hosts send no CORS headers, so the player uses a plain element
  // (and a synthetic visualizer) rather than the analyser graph.
  setTrackHint(id, { streamUrl: s.url_resolved, cors: false });
  return {
    id,
    provider: 'radio',
    title: s.name.trim(),
    artist: s.country ? `Live radio · ${s.country}` : 'Live radio',
    artworkUrl: s.favicon?.startsWith('https://') ? s.favicon : undefined,
    duration: 0,
    streamUrl: s.url_resolved,
    metadata: { genre: s.tags?.split(',')[0], popularity: s.votes ?? 0, live: true },
  };
}

export async function searchRadio(query: string, limit = 10, signal?: AbortSignal): Promise<Track[]> {
  const q = encodeURIComponent(query);
  const path = `/json/stations/search?name=${q}&limit=${limit * 2}&hidebroken=true&is_https=true&order=votes&reverse=true`;
  const stations = await get<Station[]>(path, signal);
  return stations.map(toTrack).filter((t): t is Track => t !== null).slice(0, limit);
}

/** Look a station up again after a reload (hints are in-memory only). */
export async function radioStreamUrl(id: string, signal?: AbortSignal): Promise<string | null> {
  const uuid = id.slice(RADIO_PREFIX.length);
  const list = await get<Station[]>(`/json/stations/byuuid/${encodeURIComponent(uuid)}`, signal);
  const url = list[0]?.url_resolved;
  return url?.startsWith('https://') ? url : null;
}

const LIST = 'hidebroken=true&is_https=true&order=votes&reverse=true';

/** Popular https stations carrying a tag such as "jazz" or "lofi". */
export async function radioByTag(tag: string, limit = 20, signal?: AbortSignal): Promise<Track[]> {
  const stations = await get<Station[]>(
    `/json/stations/bytagexact/${encodeURIComponent(tag)}?${LIST}&limit=${limit * 2}`,
    signal,
  );
  return stations.map(toTrack).filter((t): t is Track => t !== null).slice(0, limit);
}

/** Popular https stations from one country (ISO 3166-1 alpha-2 code). */
export async function radioByCountry(code: string, limit = 20, signal?: AbortSignal): Promise<Track[]> {
  const stations = await get<Station[]>(
    `/json/stations/bycountrycodeexact/${encodeURIComponent(code)}?${LIST}&limit=${limit * 2}`,
    signal,
  );
  return stations.map(toTrack).filter((t): t is Track => t !== null).slice(0, limit);
}
