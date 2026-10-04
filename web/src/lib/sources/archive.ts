import type { Track } from '../providers/types';
import { fetchJson } from './fetch';

export const ARCHIVE_PREFIX = 'ia-';

interface IaDoc {
  identifier: string;
  title?: string;
  creator?: string | string[];
  downloads?: number;
}

interface IaMetadata {
  files?: { name: string; format?: string; length?: string }[];
}

export async function searchArchive(query: string, limit = 10, signal?: AbortSignal): Promise<Track[]> {
  // Strip characters that have meaning in the Lucene query syntax.
  const safe = query.replace(/[^\p{L}\p{N}\s'-]/gu, ' ').trim();
  if (!safe) return [];
  const q = encodeURIComponent(`(${safe}) AND mediatype:audio AND -collection:(podcasts OR radio)`);
  const url =
    `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=downloads` +
    `&sort[]=downloads+desc&rows=${limit}&output=json`;
  const { response } = await fetchJson<{ response: { docs: IaDoc[] } }>(url, 6000, signal);
  return response.docs.map((d) => ({
    id: `${ARCHIVE_PREFIX}${d.identifier}`,
    provider: 'archive' as const,
    title: d.title || d.identifier,
    artist: (Array.isArray(d.creator) ? d.creator[0] : d.creator) || 'Internet Archive',
    artworkUrl: `https://archive.org/services/img/${encodeURIComponent(d.identifier)}`,
    duration: 0,
    externalUrl: `https://archive.org/details/${encodeURIComponent(d.identifier)}`,
    metadata: { popularity: d.downloads ?? 0 },
  }));
}

/** Pick the first MP3 file of an item and build its download URL. */
export async function archiveStreamUrl(id: string, signal?: AbortSignal): Promise<string | null> {
  const identifier = id.slice(ARCHIVE_PREFIX.length);
  const meta = await fetchJson<IaMetadata>(`https://archive.org/metadata/${encodeURIComponent(identifier)}`, 6000, signal);
  const file = meta.files?.find((f) => /mp3/i.test(f.format ?? '') && !/sample|preview/i.test(f.name));
  if (!file) return null;
  const path = file.name.split('/').map(encodeURIComponent).join('/');
  return `https://archive.org/download/${encodeURIComponent(identifier)}/${path}`;
}
