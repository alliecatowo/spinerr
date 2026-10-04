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
