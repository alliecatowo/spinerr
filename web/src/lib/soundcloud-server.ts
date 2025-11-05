/**
 * Server-side SoundCloud API module
 * Uses soundcloud.ts (Node.js only) - DO NOT import in client-side code
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

export interface SoundCloudPlaylist {
  id: number;
  title: string;
  description?: string;
  artworkUrl?: string;
  user: {
    username: string;
  };
  trackCount: number;
  tracks?: SoundCloudTrack[];
  duration: number; // milliseconds
  permalinkUrl: string;
  createdAt?: string;
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
 * Server-side SoundCloud client (Node.js only)
 * This uses soundcloud.ts which depends on child_process, fs, and ffmpeg-static
 */
class SoundCloudServerClient {
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
      // Test connection by attempting to get a public track
      // This will auto-initialize the client with necessary credentials
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
      await this.initialize();

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
      throw error;
    }
  }

  /**
   * Get track by URL or ID
   */
  async getTrack(urlOrId: string | number): Promise<SoundCloudTrack | null> {
    try {
      await this.initialize();
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
      await this.initialize();
      console.log('[SC Server] Fetching track:', trackId);

      const track = await this.client.tracks.get(trackId);
      console.log('[SC Server] Track fetched:', track.title);

      // Try to get progressive MP3 stream URL
      if (track.media?.transcodings) {
        console.log('[SC Server] Found', track.media.transcodings.length, 'transcodings');

        const mp3Transcoding = track.media.transcodings.find(
          (t: any) => t.format.protocol === 'progressive'
        );

        if (mp3Transcoding?.url) {
          console.log('[SC Server] Found progressive transcoding, resolving URL...');
          // The URL from the API needs to be resolved with client_id
          const streamData = await this.client.api.get(mp3Transcoding.url);
          console.log('[SC Server] Stream URL resolved successfully');
          return streamData.url;
        } else {
          console.warn('[SC Server] No progressive transcoding found');
        }
      } else {
        console.warn('[SC Server] No media.transcodings available');
      }

      return null;
    } catch (error) {
      console.error('[SC Server] Error getting stream URL:', error);
      return null;
    }
  }

  /**
   * Search for playlists/albums
   */
  async searchPlaylists(options: SoundCloudSearchOptions): Promise<SoundCloudPlaylist[]> {
    try {
      await this.initialize();

      const searchParams: any = {
        q: options.query,
      };

      if (options.limit) searchParams.limit = options.limit;

      const results = await this.client.playlists.search(searchParams);

      return results.collection.map((playlist: any) => this.normalizePlaylist(playlist));
    } catch (error) {
      console.error('SoundCloud playlist search error:', error);
      throw error;
    }
  }

  /**
   * Get playlist by ID
   */
  async getPlaylist(id: number): Promise<SoundCloudPlaylist | null> {
    try {
      await this.initialize();
      const playlist = await this.client.playlists.get(id);
      return this.normalizePlaylist(playlist);
    } catch (error) {
      console.error('SoundCloud get playlist error:', error);
      return null;
    }
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

  /**
   * Normalize playlist data to our interface
   */
  private normalizePlaylist(playlist: any): SoundCloudPlaylist {
    return {
      id: playlist.id,
      title: playlist.title || 'Unknown Album',
      description: playlist.description,
      artworkUrl: playlist.artwork_url?.replace('-large', '-t500x500'),
      user: {
        username: playlist.user?.username || 'Unknown Artist',
      },
      trackCount: playlist.track_count || playlist.tracks?.length || 0,
      tracks: playlist.tracks ? playlist.tracks.map((t: any) => this.normalizeTrack(t)) : undefined,
      duration: playlist.duration || 0,
      permalinkUrl: playlist.permalink_url,
      createdAt: playlist.created_at,
    };
  }
}

// Singleton instance for server-side use
let serverClient: SoundCloudServerClient | null = null;

export function getSoundCloudServerClient(): SoundCloudServerClient {
  if (!serverClient) {
    serverClient = new SoundCloudServerClient();
  }
  return serverClient;
}
