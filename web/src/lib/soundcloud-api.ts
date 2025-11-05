/**
 * SoundCloud API Client (Browser-compatible)
 * Uses server-side API proxy to avoid Node.js dependencies in browser
 */

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
 * SoundCloud API Client (Browser-compatible)
 * Proxies requests through Next.js API routes to avoid Node.js dependencies
 */
export class SoundCloudClient {
  private initialized: boolean = false;

  constructor() {
    // No initialization needed for client-side
    this.initialized = true;
  }

  /**
   * Initialize client (no-op for browser client)
   */
  async initialize(): Promise<void> {
    this.initialized = true;
  }

  /**
   * Search for tracks via API proxy
   */
  async searchTracks(options: SoundCloudSearchOptions): Promise<SoundCloudTrack[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        q: options.query,
      });

      if (options.limit) params.set('limit', options.limit.toString());
      if (options.genre) params.set('genre', options.genre);
      if (options.bpmFrom) params.set('bpmFrom', options.bpmFrom.toString());
      if (options.bpmTo) params.set('bpmTo', options.bpmTo.toString());
      if (options.durationFrom) params.set('durationFrom', options.durationFrom.toString());
      if (options.durationTo) params.set('durationTo', options.durationTo.toString());

      // Call server-side API route
      const response = await fetch(`/api/soundcloud/search?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'SoundCloud API error');
      }

      const data = await response.json();
      return data.tracks || [];
    } catch (error) {
      console.error('SoundCloud search error:', error);
      throw error;
    }
  }

  /**
   * Get track by URL or ID
   * Note: This would require a separate API route - not implemented yet
   */
  async getTrack(urlOrId: string | number): Promise<SoundCloudTrack | null> {
    console.warn('getTrack not yet implemented - requires API route');
    return null;
  }

  /**
   * Get stream URL for track
   * Note: This would require a separate API route - not implemented yet
   */
  async getStreamUrl(trackId: number): Promise<string | null> {
    console.warn('getStreamUrl not yet implemented - requires API route');
    return null;
  }

  /**
   * Get user's liked tracks (requires authentication)
   * Note: This would require a separate API route - not implemented yet
   */
  async getLikedTracks(limit = 50): Promise<SoundCloudTrack[]> {
    console.warn('getLikedTracks not yet implemented - requires API route');
    return [];
  }

  /**
   * Get user's playlists (requires authentication)
   * Note: This would require a separate API route - not implemented yet
   */
  async getPlaylists(limit = 50): Promise<any[]> {
    console.warn('getPlaylists not yet implemented - requires API route');
    return [];
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return this.initialized;
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
