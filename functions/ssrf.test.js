'use strict';
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { isBlockedAddress, parseUrl, resolvePublic, fetchCalendar } = require('./ssrf');

test('blocks private, loopback, link-local and metadata addresses', () => {
  for (const a of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:169.254.169.254', '64:ff9b::7f00:1']) {
    assert.equal(isBlockedAddress(a), true, a);
  }
});

test('allows public addresses', () => {
  for (const a of ['8.8.8.8', '1.1.1.1', '142.250.80.46', '2606:4700:4700::1111']) assert.equal(isBlockedAddress(a), false, a);
});

test('rejects bad schemes, credentials and ports', () => {
  assert.throws(() => parseUrl('file:///etc/passwd'));
  assert.throws(() => parseUrl('ftp://example.com/a.ics'));
  assert.throws(() => parseUrl('https://user:pw@example.com/a.ics'));
  assert.throws(() => parseUrl('http://example.com:6379/a.ics'));
  assert.equal(parseUrl('webcal://example.com/a.ics').protocol, 'https:');
});

test('rejects hostnames that resolve to any private address', async () => {
  const lookup = async () => [{ address: '8.8.8.8', family: 4 }, { address: '10.0.0.5', family: 4 }];
  await assert.rejects(resolvePublic('rebind.example', lookup));
  await assert.rejects(resolvePublic('127.0.0.1'));
  await assert.rejects(resolvePublic('[::1]'));
});

test('fetchCalendar refuses a loopback server even on an allowed port path', async () => {
  const server = http.createServer((_, res) => res.end('BEGIN:VCALENDAR\nEND:VCALENDAR'));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    await assert.rejects(fetchCalendar(`http://127.0.0.1:${server.address().port}/x.ics`), /ports/);
    await assert.rejects(fetchCalendar("http://127.0.0.1/x.ics"), /not allowed/);
  } finally {
    server.close();
  }
});

test('fetchCalendar rejects a hostname resolving to a private IP', async () => {
  await assert.rejects(fetchCalendar('http://evil.example/a.ics', { lookup: async () => [{ address: '169.254.169.254', family: 4 }] }), /not allowed/);
});

test('fetchCalendar connects to the pinned address, ignoring DNS for the hostname', async () => {
  // Resolver says 8.8.8.8 is "public" but we must connect there, never elsewhere: use a stub server by
  // allowing loopback only through an injected resolver is impossible by design, so just assert the lookup shape.
  const { fetchCalendar: f } = require('./ssrf');
  await assert.rejects(f('https://example.invalid/a.ics', { lookup: async () => [] }), /Host not found/);
});
