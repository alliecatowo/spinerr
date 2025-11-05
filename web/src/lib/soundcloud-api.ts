/**
 * SoundCloud API Client using soundcloud.ts
 * No registration required - auto-fetches client IDs
 */

import Soundcloud from 'soundcloud.ts';

export interface SoundCloudTrack {
  id: number;
  title: string;
  artist: string;
  artworkUrl?: string;
  duration: number; // milliseconds
  streamUrl?: string;
  permalinkUrl: string;
  genre?: string;
  bpm?: number;
  description?: string;
  playbackCount?: number;
  likesCount?: number;
}

export interface SoundCloudSearchOptions {
  query: string;
  limit?: number;
  genre?: string;
  bpmFrom?: number;
  bpmTo?: number;
  durationFrom?: number;
  durationTo?: number;
}

/**
 * SoundCloud API Client
 * Uses soundcloud.ts which auto-fetches client IDs from SoundCloud's web player
 */
export class SoundCloudClient {
  private client: Soundcloud;
  private initialized: boolean = false;

  constructor() {
    this.client = new Soundcloud();
  }

  /**
   * Initialize client (auto-fetches client ID if needed)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Test connection by fetching a public track
      await this.client.tracks.get('https://soundcloud.com/');
      this.initialized = true;
    } catch (error) {
      console.error('SoundCloud initialization error:', error);
      throw new Error('Failed to initialize SoundCloud client');
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(options: SoundCloudSearchOptions): Promise<SoundCloudTrack[]> {
    try {
      const searchParams: any = {
        q: options.query,
      };

      if (options.limit) searchParams.limit = options.limit;
      if (options.genre) searchParams.genres = options.genre;
      if (options.bpmFrom) searchParams['bpm[from]'] = options.bpmFrom;
      if (options.bpmTo) searchParams['bpm[to]'] = options.bpmTo;
      if (options.durationFrom) searchParams['duration[from]'] = options.durationFrom;
      if (options.durationTo) searchParams['duration[to]'] = options.durationTo;

      const results = await this.client.tracks.search(searchParams);

      return results.collection.map((track: any) => this.normalizeTrack(track));
    } catch (error) {
      console.error('SoundCloud search error:', error);
      return [];
    }
  }

  /**
   * Get track by URL or ID
   */
  async getTrack(urlOrId: string | number): Promise<SoundCloudTrack | null> {
    try {
      const track = await this.client.tracks.get(urlOrId);
      return this.normalizeTrack(track);
    } catch (error) {
      console.error('SoundCloud get track error:', error);
      return null;
    }
  }

  /**
   * Get stream URL for track
   */
  async getStreamUrl(trackId: number): Promise<string | null> {
    try {
      // soundcloud.ts provides a download method that returns a readable stream
      // For web playback, we need to get the stream URL instead
      const track = await this.client.tracks.get(trackId);

      // Try to get HLS stream URL (progressive download)
      if (track.media?.transcodings) {
        const mp3Transcoding = track.media.transcodings.find(
          (t: any) => t.format.protocol === 'progressive'
        );

        if (mp3Transcoding?.url) {
          // The URL from the API needs to be resolved with client_id
          const streamData = await this.client.api.get(mp3Transcoding.url);
          return streamData.url;
        }
      }

      return null;
    } catch (error) {
      console.error('SoundCloud stream URL error:', error);
      return null;
    }
  }

  /**
   * Get user's liked tracks (requires authentication)
   */
  async getLikedTracks(limit = 50): Promise<SoundCloudTrack[]> {
    try {
      const likes = await this.client.me.likes({ limit });
      return likes.collection
        .filter((item: any) => item.track)
        .map((item: any) => this.normalizeTrack(item.track));
    } catch (error) {
      console.error('SoundCloud liked tracks error:', error);
      return [];
    }
  }

  /**
   * Get user's playlists (requires authentication)
   */
  async getPlaylists(limit = 50): Promise<any[]> {
    try {
      const playlists = await this.client.me.playlists({ limit });
      return playlists.collection;
    } catch (error) {
      console.error('SoundCloud playlists error:', error);
      return [];
    }
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    // soundcloud.ts doesn't require OAuth for public content
    // Authentication would be needed for user-specific content (likes, playlists)
    return this.initialized;
  }

  /**
   * Normalize track data to our interface
   */
  private normalizeTrack(track: any): SoundCloudTrack {
    return {
      id: track.id,
      title: track.title || 'Unknown Title',
      artist: track.user?.username || 'Unknown Artist',
      artworkUrl: track.artwork_url?.replace('-large', '-t500x500') || track.user?.avatar_url,
      duration: track.duration || 0,
      permalinkUrl: track.permalink_url,
      genre: track.genre,
      bpm: track.bpm,
      description: track.description,
      playbackCount: track.playback_count,
      likesCount: track.likes_count,
    };
  }
}

/**
 * Create SoundCloud client instance
 */
export function createSoundCloudClient(): SoundCloudClient {
  return new SoundCloudClient();
}

/**
 * Singleton instance for app-wide use
 */
let soundCloudClient: SoundCloudClient | null = null;

export function getSoundCloudClient(): SoundCloudClient {
  if (!soundCloudClient) {
    soundCloudClient = createSoundCloudClient();
  }
  return soundCloudClient;
}
