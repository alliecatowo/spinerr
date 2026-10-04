'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { handle, clampInt, normalizeTrack } = require('./soundcloud');

function mockRes() {
  const res = { headers: {}, code: 200, body: null };
  res.set = (k, v) => ((res.headers[k] = v), res);
  res.status = (c) => ((res.code = c), res);
  res.json = (b) => ((res.body = b), res);
  return res;
}

test('clampInt guards NaN and range', () => {
  assert.equal(clampInt('abc', 1, 25, 15), 15);
  assert.equal(clampInt('999', 1, 25, 15), 25);
  assert.equal(clampInt('0', 1, 25, 15), 1);
});

test('search drops unstreamable tracks and caps query', async () => {
  const sc = { tracks: { search: async ({ q, limit }) => ({ collection: [{ id: 1, title: q, streamable: true, duration: 90000 }, { id: 2, streamable: true, policy: 'SNIP' }] }) } };
  const res = mockRes();
  await handle({ path: '/api/soundcloud/search', query: { q: 'x'.repeat(500) } }, res, { client: sc });
  assert.equal(res.body.tracks.length, 1);
  assert.equal(res.body.tracks[0].title.length, 100);
});

test('stream validates ids', async () => {
  const res = mockRes();
  await handle({ path: '/api/soundcloud/stream', query: { trackId: '../etc' } }, res, { client: {} });
  assert.equal(res.code, 400);
  const ok = mockRes();
  await handle({ path: '/api/soundcloud/stream', query: { trackId: 'sc-123' } }, ok, { client: { util: { streamLink: async (id) => `https://cdn/${id}` } } });
  assert.equal(ok.body.streamUrl, 'https://cdn/123');
});

test('normalizeTrack converts duration to seconds', () => {
  assert.equal(normalizeTrack({ id: 1, duration: 61000 }).duration, 61);
});
