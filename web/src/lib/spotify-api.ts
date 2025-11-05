/**
 * Spotify Web API with PKCE OAuth Flow
 * Uses user's own Spotify Developer App credentials
 */

import { SpotifyApi } from '@spotify/web-api-ts-sdk';

// Spotify OAuth endpoints
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

// Required scopes for our app
const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-top-read',
  'user-read-recently-played',
];

/**
 * Generate cryptographically random string for code verifier
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate code challenge from verifier using SHA-256
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encode
 */
function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * PKCE OAuth Flow Manager
 */
export class SpotifyPKCE {
  private clientId: string;
  private redirectUri: string;
  private codeVerifier: string | null = null;

  constructor(clientId: string, redirectUri: string) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  /**
   * Step 1: Redirect user to Spotify authorization
   */
  async authorize(): Promise<void> {
    // Generate and store code verifier
    this.codeVerifier = generateCodeVerifier();
    sessionStorage.setItem('spotify_code_verifier', this.codeVerifier);

    // Generate code challenge
    const codeChallenge = await generateCodeChallenge(this.codeVerifier);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: SCOPES.join(' '),
    });

    // Redirect to Spotify
    window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
  }

  /**
   * Step 2: Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    // Retrieve stored code verifier
    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found. Please restart authorization.');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
    }

    const data = await response.json();

    // Clean up verifier
    sessionStorage.removeItem('spotify_code_verifier');

    return data;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
    }

    return await response.json();
  }
}

/**
 * Spotify API Client
 * Manages authentication state and API calls
 */
export class SpotifyClient {
  private sdk: SpotifyApi | null = null;
  private pkce: SpotifyPKCE;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  constructor(clientId: string, redirectUri: string) {
    this.pkce = new SpotifyPKCE(clientId, redirectUri);
  }

  /**
   * Start OAuth flow
   */
  async login(): Promise<void> {
    await this.pkce.authorize();
  }

  /**
   * Complete OAuth flow with callback code
   */
  async handleCallback(code: string): Promise<void> {
    const tokens = await this.pkce.exchangeCodeForToken(code);

    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = Date.now() + tokens.expires_in * 1000;

    // Initialize SDK
    this.sdk = SpotifyApi.withAccessToken(this.pkce['clientId'], {
      access_token: this.accessToken,
      token_type: 'Bearer',
      expires_in: tokens.expires_in,
      refresh_token: this.refreshToken,
    });
  }

  /**
   * Check if token is expired and refresh if needed
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.expiresAt || !this.refreshToken) {
      throw new Error('Not authenticated');
    }

    // Refresh if token expires in less than 5 minutes
    if (Date.now() >= this.expiresAt - 5 * 60 * 1000) {
      const tokens = await this.pkce.refreshAccessToken(this.refreshToken);
      this.accessToken = tokens.access_token;
      this.expiresAt = Date.now() + tokens.expires_in * 1000;

      // Update SDK
      this.sdk = SpotifyApi.withAccessToken(this.pkce['clientId'], {
        access_token: this.accessToken,
        token_type: 'Bearer',
        expires_in: tokens.expires_in,
        refresh_token: this.refreshToken,
      });
    }
  }

  /**
   * Get user's saved tracks
   */
  async getSavedTracks(limit = 50, offset = 0) {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    return await this.sdk.currentUser.tracks.savedTracks(limit as any, offset);
  }

  /**
   * Get user's playlists
   */
  async getPlaylists(limit = 50, offset = 0) {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    return await this.sdk.currentUser.playlists.playlists(limit as any, offset);
  }

  /**
   * Get currently playing track
   */
  async getCurrentlyPlaying() {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    return await this.sdk.player.getCurrentlyPlayingTrack();
  }

  /**
   * Play a track
   */
  async play(uris?: string[], contextUri?: string) {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    await this.sdk.player.startResumePlayback(undefined as any, contextUri, uris);
  }

  /**
   * Pause playback
   */
  async pause() {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    await this.sdk.player.pausePlayback(undefined as any);
  }

  /**
   * Skip to next track
   */
  async skipToNext() {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    await this.sdk.player.skipToNext(undefined as any);
  }

  /**
   * Skip to previous track
   */
  async skipToPrevious() {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    await this.sdk.player.skipToPrevious(undefined as any);
  }

  /**
   * Search for tracks, albums, artists
   */
  async search(query: string, types: Array<'track' | 'album' | 'artist'> = ['track'], limit = 20) {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    return await this.sdk.search(query, types, undefined, limit as any);
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    await this.ensureValidToken();
    if (!this.sdk) throw new Error('Not authenticated');

    return await this.sdk.currentUser.profile();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && this.sdk !== null;
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    this.sdk = null;
    sessionStorage.removeItem('spotify_code_verifier');
  }
}

/**
 * Create Spotify client instance
 */
export function createSpotifyClient(clientId: string, redirectUri: string): SpotifyClient {
  return new SpotifyClient(clientId, redirectUri);
}
