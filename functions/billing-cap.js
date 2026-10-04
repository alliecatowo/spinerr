'use strict';

/**
 * Hard billing cap, following Google's "Disable billing usage with
 * notifications" pattern: a budget publishes to a Pub/Sub topic, and this
 * function detaches the billing account from the project once spend reaches
 * 100% of the budget. Detaching billing stops all paid services.
 */

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'spinerr-app';

/** Decide what a budget notification means. Pure so it can be unit tested. */
function evaluateBudgetMessage(data) {
  if (!data || typeof data.costAmount !== 'number' || typeof data.budgetAmount !== 'number') {
    return { action: 'ignore', reason: 'malformed notification' };
  }
  if (data.budgetAmount <= 0) {
    return { action: 'ignore', reason: 'budget amount is not positive' };
  }
  if (data.costAmount < data.budgetAmount) {
    return { action: 'ignore', reason: `cost ${data.costAmount} is under budget ${data.budgetAmount}` };
  }
  return { action: 'disable', reason: `cost ${data.costAmount} reached budget ${data.budgetAmount}` };
}

async function disableBilling(client, projectId) {
  const name = `projects/${projectId}`;
  const [info] = await client.getProjectBillingInfo({ name });
  if (!info.billingEnabled) return 'billing already disabled';
  await client.updateProjectBillingInfo({ name, projectBillingInfo: { billingAccountName: '' } });
  return 'billing disabled';
}

module.exports = { evaluateBudgetMessage, disableBilling, PROJECT_ID };
