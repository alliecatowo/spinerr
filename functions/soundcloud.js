'use strict';

/**
 * SoundCloud proxy. SoundCloud's web API sends no CORS headers and its
 * dev-app registration is closed, so the browser asks this function, which
 * uses the soundcloud.ts client (it discovers a public client id itself).
 * Hosting rewrites /api/soundcloud/** here.
 */

let client;
function getClient() {
  if (!client) {
    const mod = require('soundcloud.ts');
    const Soundcloud = mod.default?.default || mod.default || mod.Soundcloud || mod;
    client = new Soundcloud();
  }
  return client;
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function normalizeTrack(t) {
  return {
    id: t.id,
    title: t.title || 'Unknown title',
    artist: t.user?.username || 'Unknown artist',
    artworkUrl: (t.artwork_url || t.user?.avatar_url || '').replace('-large', '-t500x500') || undefined,
    duration: Math.round((t.duration || 0) / 1000),
    permalinkUrl: t.permalink_url,
    genre: t.genre || undefined,
    playbackCount: t.playback_count ?? 0,
    streamable: t.streamable !== false && t.policy !== 'SNIP' && t.policy !== 'BLOCK',
  };
}

async function handle(req, res, deps = {}) {
  const sc = deps.client || getClient();
  const route = req.path.replace(/^\/api\/soundcloud\/?/, '').replace(/\/+$/, '');
  res.set('Cache-Control', 'no-store');

  if (route === 'search') {
    const q = String(req.query.q ?? '').trim().slice(0, 100);
    if (!q) return res.status(400).json({ error: 'q is required' });
    const limit = clampInt(req.query.limit, 1, 25, 15);
    const result = await sc.tracks.search({ q, limit });
    const tracks = result.collection.map(normalizeTrack).filter((t) => t.streamable);
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    return res.json({ tracks });
  }

  if (route === 'stream') {
    const trackId = String(req.query.trackId ?? '').replace(/^(sc-|soundcloud-)/, '');
    if (!/^\d{1,15}$/.test(trackId)) return res.status(400).json({ error: 'invalid trackId' });
    const streamUrl = await sc.util.streamLink(trackId, 'progressive');
    if (!streamUrl) return res.status(404).json({ error: 'no stream available' });
    return res.json({ streamUrl });
  }

  return res.status(404).json({ error: 'not found' });
}

module.exports = { handle, clampInt, normalizeTrack };
