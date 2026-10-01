/**
 * Build-time capabilities.
 *
 * `pnpm build:static` sets NEXT_PUBLIC_SPINERR_STATIC=1 and produces a plain
 * static export (web/out) for Firebase Hosting. That build has no server, so
 * the SoundCloud proxy routes under app/api are not available: SoundCloud's
 * API does not allow browser (CORS) requests, so it only works in `pnpm dev`
 * or a `next start` server build.
 */
export const IS_STATIC_BUILD = process.env.NEXT_PUBLIC_SPINERR_STATIC === '1';

export const SOUNDCLOUD_AVAILABLE = !IS_STATIC_BUILD;

export const SOUNDCLOUD_UNAVAILABLE_MESSAGE =
  'SoundCloud search needs the Spinerr server (it proxies the SoundCloud API), so it is off on this static build. Play files from your computer instead.';
