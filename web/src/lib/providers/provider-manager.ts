/**
 * Multi-Provider Music Manager
 * Handles multiple music providers with smart prioritization
 */

import type { Album, ProviderId, SearchResults, SearchOptions } from './types';
import { createSpotifyClient, SpotifyClient } from '../spotify-api';
import { SoundCloudClient } from '../soundcloud-api';

export interface ProviderConfig {
  id: ProviderId;
  enabled: boolean;
  priority: number; // Higher = preferred (Spotify=10, SoundCloud=5)
  authenticated: boolean;
}

export interface SearchResult {
  album: Album;
  provider: ProviderId;
  score: number; // Relevance + provider priority
}

/**
 * Provider Manager with Smart Prioritization
 *
 * Prioritization Strategy:
 * 1. Spotify (priority=10): Mainstream artists, albums, high-quality streams
 * 2. SoundCloud (priority=5): Indie artists, mixes, exclusive content, remixes
 *
 * For search results:
 * - If both have the same track/album: prefer Spotify (better quality/integration)
 * - SoundCloud-only content: shows unique indie/mix content
 * - Users can explicitly filter by provider if needed
 */
export class ProviderManager {
  private static instance: ProviderManager;
  private spotifyClient: SpotifyClient | null = null;
  private soundcloudClient: SoundCloudClient;
  private configs: Map<ProviderId, ProviderConfig> = new Map();

  private constructor() {
    this.soundcloudClient = new SoundCloudClient();

    // Initialize provider configs
    this.configs.set('spotify', {
      id: 'spotify',
      enabled: false,
      priority: 10,
      authenticated: false,
    });

    this.configs.set('soundcloud', {
      id: 'soundcloud',
      enabled: true, // Always enabled (free music player)
      priority: 5,
      authenticated: false,
    });

    // Load saved Spotify credentials
    this.initializeSpotify();
  }

  static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  private initializeSpotify(): void {
    if (typeof window === 'undefined') return;

    const clientId = localStorage.getItem('spotify_client_id');
    const redirectUri = localStorage.getItem('spotify_redirect_uri');

    if (clientId && redirectUri) {
      this.spotifyClient = createSpotifyClient(clientId, redirectUri);

      if (this.spotifyClient.isAuthenticated()) {
        this.updateConfig('spotify', {
          enabled: true,
          authenticated: true
        });
      }
    }
  }

  /**
   * Update provider configuration
   */
  updateConfig(providerId: ProviderId, updates: Partial<ProviderConfig>): void {
    const config = this.configs.get(providerId);
    if (config) {
      this.configs.set(providerId, { ...config, ...updates });
    }
  }

  /**
   * Get active providers (enabled and authenticated if required)
   */
  getActiveProviders(): ProviderId[] {
    return Array.from(this.configs.values())
      .filter(c => c.enabled && (c.id === 'soundcloud' || c.authenticated))
      .sort((a, b) => b.priority - a.priority)
      .map(c => c.id);
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(providerId: ProviderId): boolean {
    const config = this.configs.get(providerId);
    return config?.enabled && (providerId === 'soundcloud' || config.authenticated) || false;
  }

  /**
   * Get provider priority
   */
  getProviderPriority(providerId: ProviderId): number {
    return this.configs.get(providerId)?.priority || 0;
  }

  /**
   * Smart search across multiple providers
   *
   * Returns results with provider info and combined scoring
   */
  async searchAlbums(query: string, filterProvider?: ProviderId): Promise<SearchResult[]> {
    const activeProviders = filterProvider
      ? [filterProvider].filter(p => this.isProviderAvailable(p))
      : this.getActiveProviders();

    if (activeProviders.length === 0) {
      console.warn('No active providers available');
      return [];
    }

    // Search all active providers in parallel
    const searchPromises = activeProviders.map(async (providerId) => {
      try {
        const results = await this.searchProvider(providerId, query);
        return results.map(album => ({
          album,
          provider: providerId,
          score: this.calculateScore(album, providerId, query),
        }));
      } catch (error) {
        console.error(`Search failed for ${providerId}:`, error);
        return [];
      }
    });

    const allResults = (await Promise.all(searchPromises)).flat();

    // Deduplicate and prioritize
    const deduped = this.deduplicateResults(allResults);

    // Sort by score (relevance + provider priority)
    return deduped.sort((a, b) => b.score - a.score);
  }

  /**
   * Search a specific provider
   */
  private async searchProvider(providerId: ProviderId, query: string): Promise<Album[]> {
    switch (providerId) {
      case 'spotify':
        return this.searchSpotify(query);
      case 'soundcloud':
        return this.searchSoundCloud(query);
      default:
        return [];
    }
  }

  /**
   * Search Spotify
   */
  private async searchSpotify(query: string): Promise<Album[]> {
    if (!this.spotifyClient || !this.spotifyClient.isAuthenticated()) {
      return [];
    }

    try {
      const results = await this.spotifyClient.search(query, ['album'], 20);

      // Convert Spotify albums to our Album format
      return results.albums.items.map(album => ({
        id: album.id,
        provider: 'spotify' as ProviderId,
        title: album.name,
        artist: album.artists[0]?.name || 'Unknown Artist',
        artworkUrl: album.images[0]?.url,
        year: album.release_date ? new Date(album.release_date).getFullYear() : undefined,
        trackCount: album.total_tracks,
        tracks: [], // Will be loaded separately
        duration: 0, // Will be calculated when tracks are loaded
        externalUrl: album.external_urls.spotify,
      }));
    } catch (error) {
      console.error('Spotify search error:', error);
      return [];
    }
  }

  /**
   * Search SoundCloud (existing implementation via API routes)
   */
  private async searchSoundCloud(query: string): Promise<Album[]> {
    try {
      // Use existing SoundCloud album search
      const response = await fetch(`/api/soundcloud/albums?query=${encodeURIComponent(query)}&limit=20`);

      if (!response.ok) {
        throw new Error('SoundCloud search failed');
      }

      const data = await response.json();
      return data.albums || [];
    } catch (error) {
      console.error('SoundCloud search error:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for result
   * Combines:
   * - Provider priority (Spotify=10, SoundCloud=5)
   * - Text match quality (exact match > partial match)
   * - Popularity indicators (if available)
   */
  private calculateScore(album: Album, providerId: ProviderId, query: string): number {
    const providerPriority = this.getProviderPriority(providerId);

    // Normalize strings for comparison
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedTitle = album.title.toLowerCase();
    const normalizedArtist = album.artist.toLowerCase();

    // Text relevance scoring
    let textScore = 0;

    // Exact match = highest score
    if (normalizedTitle === normalizedQuery || normalizedArtist === normalizedQuery) {
      textScore = 100;
    }
    // Starts with query
    else if (normalizedTitle.startsWith(normalizedQuery) || normalizedArtist.startsWith(normalizedQuery)) {
      textScore = 80;
    }
    // Contains query
    else if (normalizedTitle.includes(normalizedQuery) || normalizedArtist.includes(normalizedQuery)) {
      textScore = 60;
    }
    // Partial word match
    else {
      const queryWords = normalizedQuery.split(' ');
      const matchedWords = queryWords.filter(word =>
        normalizedTitle.includes(word) || normalizedArtist.includes(word)
      );
      textScore = (matchedWords.length / queryWords.length) * 40;
    }

    // Combined score: text relevance + provider priority
    return textScore + providerPriority;
  }

  /**
   * Deduplicate results across providers
   * If same album/artist exists on multiple providers, prefer higher priority
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Map<string, SearchResult>();

    for (const result of results) {
      // Create key based on normalized title + artist
      const key = `${result.album.title.toLowerCase().trim()}-${result.album.artist.toLowerCase().trim()}`;

      const existing = seen.get(key);

      // Keep result with higher score (which includes provider priority)
      if (!existing || result.score > existing.score) {
        seen.set(key, result);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Get Spotify client (for direct access if needed)
   */
  getSpotifyClient(): SpotifyClient | null {
    return this.spotifyClient;
  }

  /**
   * Get SoundCloud client (for direct access if needed)
   */
  getSoundCloudClient(): SoundCloudClient {
    return this.soundcloudClient;
  }
}

// Export singleton instance
export const providerManager = ProviderManager.getInstance();
