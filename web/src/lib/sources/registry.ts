/**
 * Playback hints for tracks found through the music sources.
 *
 * Track ids are source-prefixed (audius-, radio-, ia-, sc-). The registry
 * remembers extra facts learned at search time (a direct stream URL, whether
 * the host sends CORS headers, and equivalent copies on other sources to fall
 * back to). Everything here is optional: ids alone are enough to resolve a
 * stream again after a reload.
 */
import type { Track } from '../providers/types';

export interface TrackHint {
  /** Direct stream URL if already known (radio stations). */
  streamUrl?: string;
  /** False when the stream host does not send CORS headers. */
  cors?: boolean;
  /** Equivalent tracks on other sources, best first, used when this one fails. */
  alternates?: Track[];
}

const hints = new Map<string, TrackHint>();

export function setTrackHint(id: string, hint: TrackHint): void {
  hints.set(id, { ...hints.get(id), ...hint });
}

export function getTrackHint(id: string): TrackHint | undefined {
  return hints.get(id);
}

export function clearTrackHints(): void {
  hints.clear();
}
