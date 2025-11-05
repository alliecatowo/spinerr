/**
 * Unified Music Provider Types
 * Common interfaces for all music providers (SoundCloud, YouTube, Spotify, Local)
 */

export type ProviderId = 'soundcloud' | 'youtube' | 'spotify' | 'local';

/**
 * Common track interface
 */
export interface Track {
  id: string;
  provider: ProviderId;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  duration: number; // seconds
  streamUrl?: string;
  externalUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Common album interface - Primary unit of the music library
 */
export interface Album {
  id: string;
  provider: ProviderId;
  title: string;
  artist: string;
  artworkUrl?: string;
  year?: number;
  trackCount: number;
  tracks: Track[];  // Full track list
  duration: number; // total duration in seconds
  externalUrl?: string;
}

/**
 * Common artist interface
 */
export interface Artist {
  id: string;
  provider: ProviderId;
  name: string;
  imageUrl?: string;
  bio?: string;
  externalUrl?: string;
}

/**
 * Common playlist interface
 */
export interface Playlist {
  id: string;
  provider: ProviderId;
  title: string;
  description?: string;
  artworkUrl?: string;
  trackCount: number;
  owner?: string;
  externalUrl?: string;
}

/**
 * Search options
 */
export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  type?: 'track' | 'album' | 'artist' | 'playlist';
}

/**
 * Search results
 */
export interface SearchResults {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  total: number;
}

/**
 * Playback state
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  currentTrack?: Track;
}

/**
 * Music Provider Interface
 * All providers must implement this interface
 */
export interface MusicProvider {
  /**
   * Provider identification
   */
  readonly id: ProviderId;
  readonly name: string;
  readonly icon?: string;

  /**
   * Authentication
   */
  isAuthenticated(): boolean;
  login?(): Promise<void>;
  logout?(): void;

  /**
   * Search
   */
  search(options: SearchOptions): Promise<SearchResults>;

  /**
   * Track operations
   */
  getTrack(id: string): Promise<Track | null>;
  getTracks(ids: string[]): Promise<Track[]>;

  /**
   * Playback
   */
  play(track: Track): Promise<void>;
  pause(): void;
  stop?(): void;
  seek?(seconds: number): void;
  setVolume?(volume: number): void;

  /**
   * Playback state
   */
  getPlaybackState?(): PlaybackState;

  /**
   * User library (optional - requires authentication)
   */
  getSavedTracks?(limit?: number): Promise<Track[]>;
  getPlaylists?(limit?: number): Promise<Playlist[]>;
  saveTrack?(trackId: string): Promise<void>;
  unsaveTrack?(trackId: string): Promise<void>;
}

/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
  supportsSearch: boolean;
  supportsPlayback: boolean;
  supportsAuth: boolean;
  supportsUserLibrary: boolean;
  supportsPlaylists: boolean;
  requiresAuth: boolean;
}

/**
 * Provider config
 */
export interface ProviderConfig {
  enabled: boolean;
  priority?: number;
  credentials?: Record<string, string>;
}

/**
 * Meta Record Types - Different types of collections in the library
 */
export type RecordType = 'album' | 'favorites' | 'artist-discography' | 'playlist';

export interface MetaRecord {
  id: string;
  type: RecordType;
  title: string;
  artworkUrl?: string;
  trackCount: number;
}

/**
 * Favorites meta record - Collection of individual favorite tracks
 */
export interface FavoritesRecord extends MetaRecord {
  type: 'favorites';
  favoriteTracks: Track[]; // From any albums user has favorited individual tracks from
}

/**
 * Artist discography meta record - All albums from a single artist
 */
export interface ArtistDiscographyRecord extends MetaRecord {
  type: 'artist-discography';
  artistId: string;
  artistName: string;
  albums: Album[];
}

/**
 * Playlist meta record - Custom collection of tracks (4-100 songs)
 */
export interface PlaylistRecord extends MetaRecord {
  type: 'playlist';
  tracks: Track[]; // Min 4, Max 100
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Library - Album-focused music collection
 */
export interface UserLibrary {
  albums: Album[];          // User's collection of albums
  playlists: PlaylistRecord[];  // Custom playlists (4-100 tracks each)
  recentlyPlayed: Album[];  // Last played albums (max 10)
  favorites: string[];      // Track IDs marked as favorite
}
