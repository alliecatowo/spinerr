/**
 * Local file playback.
 *
 * Files picked by the user are played straight from object URLs, so nothing
 * is uploaded anywhere. The URLs only live for the current page session, so
 * local albums are excluded from the persisted library (see store.ts).
 */
import type { Album, Track } from './providers/types';
import { extractMetadata } from './file-system';

const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|webm)$/i;

const objectUrls = new Map<string, string>();

export const LOCAL_TRACK_PREFIX = 'local-';

export function isLocalTrackId(id: string): boolean {
  return id.startsWith(LOCAL_TRACK_PREFIX);
}

export function getLocalTrackUrl(id: string): string | undefined {
  return objectUrls.get(id);
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/') || AUDIO_EXTENSIONS.test(file.name);
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Read the duration of an audio file without playing it. */
function readDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const done = (value: number) => {
      audio.removeAttribute('src');
      resolve(Number.isFinite(value) ? Math.round(value) : 0);
    };
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => done(audio.duration);
    audio.onerror = () => done(0);
    audio.src = url;
  });
}

/**
 * Turn picked files into a playable album. Track order follows file name
 * order, and the first embedded cover art becomes the album artwork (and the
 * vinyl label).
 */
export async function createLocalAlbum(files: File[]): Promise<Album | null> {
  const audioFiles = files
    .filter(isAudioFile)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (audioFiles.length === 0) return null;

  let artworkUrl: string | undefined;

  const tracks: Track[] = await Promise.all(
    audioFiles.map(async (file) => {
      const id = `${LOCAL_TRACK_PREFIX}${randomId()}`;
      const url = URL.createObjectURL(file);
      objectUrls.set(id, url);

      const [metadata, duration] = await Promise.all([
        extractMetadata(file),
        readDuration(url),
      ]);

      if (!artworkUrl && metadata.picture) {
        const blob = new Blob([new Uint8Array(metadata.picture.data)], { type: metadata.picture.format });
        artworkUrl = URL.createObjectURL(blob);
      }

      return {
        id,
        provider: 'local' as const,
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        duration,
        metadata: { genre: metadata.genre, fileName: file.name },
      };
    })
  );

  const first = tracks[0];
  const albumTitle = first.album && first.album !== 'Unknown Album'
    ? first.album
    : audioFiles.length === 1 ? first.title : 'Local files';

  return {
    id: `local-album-${randomId()}`,
    provider: 'local',
    title: albumTitle,
    artist: first.artist,
    artworkUrl,
    trackCount: tracks.length,
    tracks: tracks.map((t) => ({ ...t, artworkUrl })),
    duration: tracks.reduce((sum, t) => sum + t.duration, 0),
  };
}
