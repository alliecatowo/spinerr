import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Track } from '../providers/types';
import { dedupeKey, rankAndDedupe } from '../sources/rank';
import { resolveTrackSource } from '../sources/resolve';
import { setTrackHint, clearTrackHints } from '../sources/registry';
import { archiveStreamUrl } from '../sources/archive';

const track = (over: Partial<Track>): Track => ({
  id: 'audius-1',
  provider: 'audius',
  title: 'Song',
  artist: 'Artist',
  duration: 200,
  ...over,
});

afterEach(() => {
  vi.restoreAllMocks();
  clearTrackHints();
});

describe('dedupeKey', () => {
  it('collapses punctuation, feat tags and artist prefixes', () => {
    const a = track({ title: 'Artist - Song (Official Audio)', artist: 'Artist' });
    const b = track({ title: 'Song', artist: 'ARTIST' });
    expect(dedupeKey(a)).toBe(dedupeKey(b));
  });

  it('keeps different songs apart', () => {
    expect(dedupeKey(track({ title: 'One' }))).not.toBe(dedupeKey(track({ title: 'Two' })));
  });
});

describe('rankAndDedupe', () => {
  it('keeps the best-source copy and records the rest as alternates', () => {
    const sc = track({ id: 'sc-1', provider: 'soundcloud', title: 'Blue Hour', artist: 'Nia' });
    const au = track({ id: 'audius-9', provider: 'audius', title: 'Blue Hour', artist: 'Nia' });
    const result = rankAndDedupe([sc, au], 'blue hour');
    expect(result).toHaveLength(1);
    expect(result[0].track.id).toBe('audius-9');
    expect(result[0].alternates.map((t) => t.id)).toEqual(['sc-1']);
  });

  it('ranks exact title matches above weaker ones', () => {
    const exact = track({ id: 'audius-a', title: 'Dawn', artist: 'X' });
    const loose = track({ id: 'audius-b', title: 'Before Dawn Breaks Again', artist: 'Y' });
    const [first] = rankAndDedupe([loose, exact], 'dawn');
    expect(first.track.id).toBe('audius-a');
  });
});

describe('resolveTrackSource', () => {
  it('resolves audius ids to a CORS-enabled stream url', async () => {
    const r = await resolveTrackSource('audius-abc');
    expect(r.url).toContain('/tracks/abc/stream');
    expect(r.cors).toBe(true);
  });

  it('uses radio hints and marks them non-CORS', async () => {
    setTrackHint('radio-x', { streamUrl: 'https://example.com/live', cors: false });
    expect(await resolveTrackSource('radio-x')).toEqual({ url: 'https://example.com/live', cors: false });
  });

  it('rejects unknown ids', async () => {
    await expect(resolveTrackSource('mystery')).rejects.toThrow();
  });
});

describe('archiveStreamUrl', () => {
  it('picks the first mp3 and encodes the path', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ files: [{ name: 'a.flac', format: 'Flac' }, { name: 'disc 1/a b.mp3', format: 'VBR MP3' }] }),
      })),
    );
    expect(await archiveStreamUrl('ia-item')).toBe('https://archive.org/download/item/disc%201/a%20b.mp3');
  });
});
