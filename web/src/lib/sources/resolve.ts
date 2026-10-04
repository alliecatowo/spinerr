import { isLocalTrackId, getLocalTrackUrl } from '../local-files';
import { AUDIUS_PREFIX, audiusStreamUrl } from './audius';
import { ARCHIVE_PREFIX, archiveStreamUrl } from './archive';
import { RADIO_PREFIX, radioStreamUrl } from './radio';
import { getTrackHint } from './registry';

export interface ResolvedSource {
  url: string;
  /** True when the host sends CORS headers, so the Web Audio analyser can read it. */
  cors: boolean;
}

/** Turn a source-prefixed track id into something an audio element can play. */
export async function resolveTrackSource(id: string): Promise<ResolvedSource> {
  const hint = getTrackHint(id);

  if (isLocalTrackId(id)) {
    const url = getLocalTrackUrl(id);
    if (!url) throw new Error('This local file is no longer available. Pick it again to play it.');
    return { url, cors: true };
  }
  if (id.startsWith(AUDIUS_PREFIX)) {
    return { url: audiusStreamUrl(id.slice(AUDIUS_PREFIX.length)), cors: true };
  }
  if (id.startsWith(ARCHIVE_PREFIX)) {
    const url = await archiveStreamUrl(id);
    if (!url) throw new Error('This Internet Archive item has no playable audio.');
    return { url, cors: true };
  }
  if (id.startsWith(RADIO_PREFIX)) {
    const url = hint?.streamUrl ?? (await radioStreamUrl(id));
    if (!url) throw new Error('This station is no longer available.');
    return { url, cors: false };
  }
  if (id.startsWith('spotify-') || /^[0-9A-Za-z]{22}$/.test(id)) {
    throw new Error('Spotify tracks can be browsed but not streamed in Spinnerr.');
  }
  if (id.startsWith('sc-') || id.startsWith('soundcloud-')) {
    const { resolveSoundCloud } = await import('./soundcloud');
    return resolveSoundCloud(id);
  }
  throw new Error('This track cannot be played.');
}
