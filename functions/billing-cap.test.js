'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { evaluateBudgetMessage, disableBilling } = require('./billing-cap');

test('ignores spend below budget', () => {
  assert.equal(evaluateBudgetMessage({ costAmount: 2.5, budgetAmount: 5 }).action, 'ignore');
});
test('disables at exactly 100%', () => {
  assert.equal(evaluateBudgetMessage({ costAmount: 5, budgetAmount: 5 }).action, 'disable');
});
test('disables above budget', () => {
  assert.equal(evaluateBudgetMessage({ costAmount: 7, budgetAmount: 5 }).action, 'disable');
});
test('ignores malformed or zero-budget messages', () => {
  assert.equal(evaluateBudgetMessage(null).action, 'ignore');
  assert.equal(evaluateBudgetMessage({ costAmount: 'x', budgetAmount: 5 }).action, 'ignore');
  assert.equal(evaluateBudgetMessage({ costAmount: 1, budgetAmount: 0 }).action, 'ignore');
});
test('disableBilling detaches the account only when enabled', async () => {
  const calls = [];
  const client = {
    getProjectBillingInfo: async () => [{ billingEnabled: true }],
    updateProjectBillingInfo: async (req) => calls.push(req),
  };
  await disableBilling(client, 'p');
  assert.deepEqual(calls, [{ name: 'projects/p', projectBillingInfo: { billingAccountName: '' } }]);
  const off = { getProjectBillingInfo: async () => [{ billingEnabled: false }], updateProjectBillingInfo: async () => assert.fail('no call') };
  assert.equal(await disableBilling(off, 'p'), 'billing already disabled');
});
