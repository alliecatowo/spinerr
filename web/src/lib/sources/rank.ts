import type { Track, ProviderId } from '../providers/types';

/** Higher is better: full-quality, reliable, CORS-friendly sources first. */
export const SOURCE_WEIGHT: Record<string, number> = {
  audius: 1.0,
  soundcloud: 0.9,
  archive: 0.5,
  radio: 0.45,
};

export const SOURCE_LABEL: Record<string, string> = {
  audius: 'Audius',
  soundcloud: 'SoundCloud',
  archive: 'Internet Archive',
  radio: 'Radio',
  local: 'Local',
};

const NOISE = /\b(feat|ft|featuring|official|audio|video|lyrics?|remaster(ed)?|hd|hq)\b\.?/g;

/** Normalised "artist title" key, so the same song on two sources collapses. */
export function dedupeKey(track: Track): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
      .replace(NOISE, ' ')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  let title = clean(track.title);
  const artist = clean(track.artist);
  // "Artist - Title" is a common SoundCloud/Audius pattern; drop the artist prefix.
  if (artist && title.startsWith(`${artist} `)) title = title.slice(artist.length).trim();
  return `${artist}|${title}`;
}

function relevance(track: Track, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const title = track.title.toLowerCase();
  const artist = track.artist.toLowerCase();
  let score = 0;
  if (title === q) score += 1;
  else if (title.startsWith(q)) score += 0.7;
  else if (title.includes(q)) score += 0.5;
  if (artist.includes(q)) score += 0.4;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const hit = words.filter((w) => title.includes(w) || artist.includes(w)).length;
    score += 0.4 * (hit / words.length);
  }
  return score;
}

export function scoreTrack(track: Track, query: string): number {
  const weight = SOURCE_WEIGHT[track.provider as ProviderId] ?? 0.3;
  const popularity = Number(track.metadata?.popularity ?? 0);
  const pop = popularity > 0 ? Math.min(0.3, Math.log10(popularity + 1) / 20) : 0;
  const complete = (track.artworkUrl ? 0.1 : 0) + (track.duration > 0 ? 0.1 : 0);
  return relevance(track, query) * 1.5 + weight * 0.5 + pop + complete;
}

/**
 * Rank, then collapse duplicates. The best copy of a song is kept and the
 * others ride along as `alternates`, used for silent fallback when it fails.
 */
export function rankAndDedupe(tracks: Track[], query: string): { track: Track; alternates: Track[] }[] {
  const scored = tracks.map((track) => ({ track, score: scoreTrack(track, query) })).sort((a, b) => b.score - a.score);
  const groups = new Map<string, { track: Track; alternates: Track[] }>();
  const order: string[] = [];
  for (const { track } of scored) {
    const key = dedupeKey(track);
    const existing = groups.get(key);
    if (existing) existing.alternates.push(track);
    else {
      groups.set(key, { track, alternates: [] });
      order.push(key);
    }
  }
  return order.map((k) => groups.get(k)!);
}
