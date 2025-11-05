/**
 * Music Metadata APIs - MusicBrainz, Last.fm, Cover Art Archive
 */

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const COVERART_API = 'https://coverartarchive.org';
const LASTFM_API = 'https://ws.audioscrobbler.com/2.0';

// User agent is required by MusicBrainz API
const USER_AGENT = 'Spinerr/1.0.0 (https://github.com/spinerr/app)';

export interface MusicBrainzRecording {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: string;
  duration?: number;
  score?: number;
}

export interface AlbumArt {
  thumbnails: {
    small?: string;
    large?: string;
    '250'?: string;
    '500'?: string;
    '1200'?: string;
  };
  image: string;
}

/**
 * Search MusicBrainz for recording (track) information
 */
export async function searchMusicBrainz(
  query: {
    title?: string;
    artist?: string;
    album?: string;
  },
  limit = 5
): Promise<MusicBrainzRecording[]> {
  try {
    // Build search query
    const queryParts: string[] = [];
    if (query.title) queryParts.push(`recording:"${query.title}"`);
    if (query.artist) queryParts.push(`artist:"${query.artist}"`);
    if (query.album) queryParts.push(`release:"${query.album}"`);

    const searchQuery = queryParts.join(' AND ');
    const url = `${MUSICBRAINZ_API}/recording?query=${encodeURIComponent(searchQuery)}&limit=${limit}&fmt=json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const data = await response.json();

    return data.recordings?.map((rec: any) => ({
      id: rec.id,
      title: rec.title,
      artist: rec['artist-credit']?.[0]?.name || 'Unknown Artist',
      album: rec.releases?.[0]?.title,
      year: rec.releases?.[0]?.date?.substring(0, 4),
      duration: rec.length ? Math.round(rec.length / 1000) : undefined,
      score: rec.score,
    })) || [];
  } catch (error) {
    console.error('MusicBrainz search error:', error);
    return [];
  }
}

/**
 * Get album art from Cover Art Archive
 */
export async function getAlbumArt(releaseId: string): Promise<AlbumArt | null> {
  try {
    const url = `${COVERART_API}/release/${releaseId}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No artwork available
      }
      throw new Error(`Cover Art Archive error: ${response.status}`);
    }

    const data = await response.json();

    const frontCover = data.images?.find((img: any) => img.front);
    if (!frontCover) return null;

    return {
      image: frontCover.image,
      thumbnails: frontCover.thumbnails || {},
    };
  } catch (error) {
    console.error('Cover Art Archive error:', error);
    return null;
  }
}

/**
 * Search MusicBrainz for release (album) to get release ID for cover art
 */
export async function searchAlbumForArt(
  artist: string,
  album: string
): Promise<{ releaseId: string; coverArt: AlbumArt } | null> {
  try {
    const query = `artist:"${artist}" AND release:"${album}"`;
    const url = `${MUSICBRAINZ_API}/release?query=${encodeURIComponent(query)}&limit=1&fmt=json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const data = await response.json();

    const release = data.releases?.[0];
    if (!release) return null;

    const coverArt = await getAlbumArt(release.id);
    if (!coverArt) return null;

    return {
      releaseId: release.id,
      coverArt,
    };
  } catch (error) {
    console.error('Album search error:', error);
    return null;
  }
}

/**
 * Enrich metadata with online sources
 */
export async function enrichMetadata(localMetadata: {
  title: string;
  artist: string;
  album: string;
}): Promise<{
  musicbrainz?: MusicBrainzRecording;
  albumArt?: AlbumArt;
}> {
  try {
    // Search MusicBrainz for recording
    const recordings = await searchMusicBrainz({
      title: localMetadata.title,
      artist: localMetadata.artist,
      album: localMetadata.album,
    }, 1);

    const bestMatch = recordings[0];

    if (!bestMatch) {
      return {};
    }

    // Try to get album art
    let albumArt: AlbumArt | null = null;
    if (localMetadata.artist && localMetadata.album) {
      const albumInfo = await searchAlbumForArt(localMetadata.artist, localMetadata.album);
      albumArt = albumInfo?.coverArt || null;
    }

    return {
      musicbrainz: bestMatch,
      albumArt: albumArt || undefined,
    };
  } catch (error) {
    console.error('Metadata enrichment error:', error);
    return {};
  }
}

/**
 * Rate limiting helper for MusicBrainz (1 request per second)
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

export async function rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
  return fetch(url, options);
}

/**
 * Batch enrich metadata with rate limiting
 */
export async function batchEnrichMetadata(
  metadataList: Array<{ title: string; artist: string; album: string }>
): Promise<Array<{ musicbrainz?: MusicBrainzRecording; albumArt?: AlbumArt }>> {
  const results: Array<{ musicbrainz?: MusicBrainzRecording; albumArt?: AlbumArt }> = [];

  for (const metadata of metadataList) {
    const enriched = await enrichMetadata(metadata);
    results.push(enriched);

    // Add delay between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  return results;
}
