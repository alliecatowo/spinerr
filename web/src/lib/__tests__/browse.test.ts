import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SECTIONS, STATIONS, loadStation } from '../sources/browse';

vi.mock('../sources/audius', () => ({
  trendingAudius: vi.fn(async () => [
    { id: 'audius-1', provider: 'audius', title: 'A', artist: 'x', duration: 200 },
    { id: 'audius-2', provider: 'audius', title: 'B', artist: 'y', duration: 30 },
  ]),
}));
vi.mock('../sources/radio', () => ({
  radioByTag: vi.fn(async () => []),
  radioByCountry: vi.fn(async () => []),
}));
vi.mock('../sources/archive', () => ({ archiveCollection: vi.fn(async () => []) }));

describe('browse catalog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('has unique ids and every section is populated', () => {
    expect(new Set(STATIONS.map((s) => s.id)).size).toBe(STATIONS.length);
    for (const section of SECTIONS) expect(STATIONS.some((s) => s.section === section.id)).toBe(true);
  });

  it('builds a record from the playable tracks only', async () => {
    const album = await loadStation(STATIONS.find((s) => s.id === 'tr-jazz')!);
    expect(album.tracks.map((t) => t.id)).toEqual(['audius-1']);
    expect(album.provider).toBe('audius');
    expect(album.trackCount).toBe(1);
  });

  it('throws when a station has nothing playable', async () => {
    await expect(loadStation(STATIONS.find((s) => s.id === 'rt-jazz')!)).rejects.toThrow(/No playable/);
  });
});
