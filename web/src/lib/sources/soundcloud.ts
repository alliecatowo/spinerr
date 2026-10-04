import type { ResolvedSource } from './resolve';

/** SoundCloud needs the Cloud Function proxy, added separately. */
export async function resolveSoundCloud(id: string): Promise<ResolvedSource> {
  if (id.startsWith('spotify-') || /^[0-9A-Za-z]{22}$/.test(id)) {
    throw new Error('Spotify tracks can be browsed but not streamed in Spinerr yet.');
  }
  throw new Error('SoundCloud playback is not available right now.');
}
