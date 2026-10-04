'use strict';

/**
 * SSRF-safe fetching of user-supplied calendar URLs.
 *
 * - only http(s) (webcal:// is rewritten to https://), standard ports only
 * - every address the hostname resolves to must be public
 * - the connection is pinned to the address we validated (no DNS rebinding)
 * - redirects are followed manually and re-validated at every hop
 * - hard timeout and a size cap enforced while streaming
 */

const dns = require('node:dns').promises;
const net = require('node:net');
const http = require('node:http');
const https = require('node:https');

const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

const blocked = new net.BlockList();
for (const [addr, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]) {
  blocked.addSubnet(addr, prefix, 'ipv4');
}
for (const [addr, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
  ['64:ff9b::', 96], // NAT64: embeds an IPv4 address
  ['2001:db8::', 32],
  ['2002::', 16], // 6to4: embeds an IPv4 address
]) {
  blocked.addSubnet(addr, prefix, 'ipv6');
}

class FetchError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function isBlockedAddress(address) {
  const family = net.isIPv6(address) ? 'ipv6' : 'ipv4';
  if (family === 'ipv6') {
    // ::ffff:a.b.c.d is an IPv4 address in disguise.
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
    if (mapped) return blocked.check(mapped[1], 'ipv4');
  }
  return blocked.check(address, family);
}

function parseUrl(raw) {
  let url;
  try {
    url = new URL(String(raw).trim().replace(/^webcal:/i, 'https:'));
  } catch {
    throw new FetchError('Not a valid URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new FetchError('Only http(s) and webcal URLs are allowed');
  if (url.username || url.password) throw new FetchError('URLs with credentials are not allowed');
  const port = url.port || (url.protocol === 'https:' ? '443' : '80');
  if (port !== '80' && port !== '443') throw new FetchError('Only the standard web ports are allowed');
  return url;
}

/** Resolve a hostname and return one public address, or throw. */
async function resolvePublic(hostname, lookup = dns.lookup) {
  const host = hostname.replace(/^\[|\]$/g, '');
  const addresses = net.isIP(host) ? [{ address: host, family: net.isIPv6(host) ? 6 : 4 }] : await lookup(host, { all: true });
  if (!addresses.length) throw new FetchError('Host not found');
  if (addresses.some((a) => isBlockedAddress(a.address))) throw new FetchError('That address is not allowed');
  return addresses[0];
}

function requestOnce(url, target) {
  const lib = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      {
        method: 'GET',
        timeout: TIMEOUT_MS,
        headers: { 'user-agent': 'spinnerr-calendar-fetch/1.0', accept: 'text/calendar, text/plain;q=0.8, */*;q=0.5' },
        // Pin the socket to the address we validated.
        lookup: (_host, opts, cb) => (opts && opts.all ? cb(null, [{ address: target.address, family: target.family }]) : cb(null, target.address, target.family)),
      },
      resolve,
    );
    req.on('timeout', () => req.destroy(new FetchError('The calendar server took too long to respond', 504)));
    req.on('error', (e) => reject(e instanceof FetchError ? e : new FetchError('Could not reach the calendar server', 502)));
    req.end();
  });
}

async function readCapped(res, maxBytes) {
  const chunks = [];
  let size = 0;
  const deadline = Date.now() + TIMEOUT_MS;
  for await (const chunk of res) {
    size += chunk.length;
    if (size > maxBytes) {
      res.destroy();
      throw new FetchError('Calendar file is too large', 413);
    }
    if (Date.now() > deadline) {
      res.destroy();
      throw new FetchError('The calendar server took too long to respond', 504);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchCalendar(raw, { lookup = dns.lookup, maxBytes = MAX_BYTES } = {}) {
  let url = parseUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const target = await resolvePublic(url.hostname, lookup);
    const res = await requestOnce(url, target);
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      res.resume();
      url = parseUrl(new URL(res.headers.location, url).toString());
      continue;
    }
    if (res.statusCode !== 200) {
      res.resume();
      throw new FetchError(`The calendar server answered ${res.statusCode}`, 502);
    }
    const body = await readCapped(res, maxBytes);
    if (!/BEGIN:VCALENDAR/i.test(body)) throw new FetchError('That URL did not return an iCalendar file', 422);
    return body;
  }
  throw new FetchError('Too many redirects', 508);
}

module.exports = { fetchCalendar, isBlockedAddress, parseUrl, resolvePublic, FetchError, MAX_BYTES };
