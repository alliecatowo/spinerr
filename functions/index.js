'use strict';

const { onMessagePublished } = require('firebase-functions/v2/pubsub');
const { setGlobalOptions } = require('firebase-functions/v2');
const logger = require('firebase-functions/logger');
const { CloudBillingClient } = require('@google-cloud/billing');
const { evaluateBudgetMessage, disableBilling, PROJECT_ID } = require('./billing-cap');

setGlobalOptions({ region: 'us-central1', maxInstances: 3 });

exports.stopBilling = onMessagePublished(
  {
    topic: 'billing-budget-alerts',
    serviceAccount: `billing-killer@${PROJECT_ID}.iam.gserviceaccount.com`,
    maxInstances: 1,
  },
  async (event) => {
    const data = event.data.message.json;
    const verdict = evaluateBudgetMessage(data);
    if (verdict.action !== 'disable') {
      logger.info('stopBilling: no action', { reason: verdict.reason });
      return;
    }
    logger.warn('stopBilling: budget exhausted, disabling billing', { reason: verdict.reason });
    const result = await disableBilling(new CloudBillingClient(), PROJECT_ID);
    logger.warn('stopBilling: done', { result });
  },
);

const { onRequest } = require('firebase-functions/v2/https');
const { fetchCalendar, FetchError } = require('./ssrf');

// SoundCloud proxy: /api/soundcloud/** (rewrite in firebase.json)
exports.soundcloud = onRequest({ maxInstances: 3, memory: '512MiB', timeoutSeconds: 30 }, async (req, res) => {
  try {
    await require('./soundcloud').handle(req, res);
  } catch (error) {
    logger.error('soundcloud proxy failed', { message: error && error.message });
    res.status(502).json({ error: 'SoundCloud is not answering right now' });
  }
});

// ICS proxy: /api/ics?url=... (rewrite in firebase.json). The URL is never logged.
exports.ics = onRequest({ maxInstances: 3, memory: '256MiB', timeoutSeconds: 20 }, async (req, res) => {
  res.set('Cache-Control', 'private, max-age=60');
  const url = req.query.url;
  if (typeof url !== 'string' || url.length > 2000) {
    res.status(400).json({ error: 'url is required' });
    return;
  }
  try {
    const body = await fetchCalendar(url);
    res.type('text/calendar; charset=utf-8').send(body);
  } catch (error) {
    const status = error instanceof FetchError ? error.status : 502;
    res.status(status).json({ error: error instanceof FetchError ? error.message : 'Could not fetch that calendar' });
  }
});
