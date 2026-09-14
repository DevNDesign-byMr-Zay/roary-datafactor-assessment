import test from 'node:test';
import assert from 'node:assert/strict';

import { createRenewableOpportunityAdvisory } from '../src/services/renewable-opportunity-advisory.mjs';

test('surfaces a renewable opportunity without selecting or scheduling execution', () => {
  const advisory = createRenewableOpportunityAdvisory({
    renewableAvailability: 0.8,
    priority: 'normal',
    renewableWindowMinutes: 30,
  });

  assert.equal(advisory.opportunity, 'renewable-window-available');
  assert.equal(advisory.application, 'operator-or-runtime-policy-decision-required');
  assert.deepEqual(advisory.safety, {
    advisoryOnly: true,
    authoritative: false,
    schedulesWorkload: false,
    delaysWorkload: false,
    executesWorkload: false,
    physicalActuation: false,
  });
  assert.equal(Object.isFrozen(advisory), true);
  assert.equal(Object.isFrozen(advisory.evidence), true);
  assert.equal(Object.isFrozen(advisory.safety), true);
  assert.equal('strategy' in advisory, false);
  assert.equal('shouldExecute' in advisory, false);
  assert.equal('executeAt' in advisory, false);
});

test('critical workloads suppress renewable-window advice without issuing an execution command', () => {
  const advisory = createRenewableOpportunityAdvisory({
    renewableAvailability: 1,
    priority: 'critical',
    renewableWindowMinutes: 60,
  });

  assert.equal(advisory.opportunity, 'no-renewable-window');
  assert.match(advisory.reason, /critical workload priority/);
  assert.equal(advisory.safety.schedulesWorkload, false);
  assert.equal(advisory.safety.delaysWorkload, false);
});

test('below-threshold evidence remains a no-op advisory', () => {
  const advisory = createRenewableOpportunityAdvisory({
    renewableAvailability: 0.74,
    priority: 'normal',
    renewableWindowMinutes: 15,
  });

  assert.equal(advisory.opportunity, 'no-renewable-window');
  assert.match(advisory.reason, /below the advisory threshold/);
});

test('rejects malformed availability, priority, and renewable windows', () => {
  for (const renewableAvailability of [-0.1, 1.1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => createRenewableOpportunityAdvisory({ renewableAvailability }),
      /renewableAvailability must be a finite number between 0 and 1/,
    );
  }

  assert.throws(
    () => createRenewableOpportunityAdvisory({ priority: 'urgent' }),
    /unsupported workload priority/,
  );
  assert.throws(
    () => createRenewableOpportunityAdvisory({ renewableWindowMinutes: 1.5 }),
    /renewableWindowMinutes must be a non-negative integer/,
  );
  assert.throws(
    () => createRenewableOpportunityAdvisory({ renewableWindowMinutes: -1 }),
    /renewableWindowMinutes must be a non-negative integer/,
  );
});
