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

test('treats the exact 0.75 boundary as an advisory opportunity for normal priority', () => {
  const advisory = createRenewableOpportunityAdvisory({
    renewableAvailability: 0.75,
    priority: 'normal',
    renewableWindowMinutes: 0,
  });

  assert.equal(advisory.opportunity, 'renewable-window-available');
  assert.equal(advisory.evidence.renewableAvailability, 0.75);
  assert.equal(advisory.evidence.renewableWindowMinutes, 0);
  assert.equal(advisory.safety.schedulesWorkload, false);
});

test('accepts finite availability endpoints without changing advisory authority', () => {
  const none = createRenewableOpportunityAdvisory({
    renewableAvailability: 0,
    priority: 'normal',
  });
  const full = createRenewableOpportunityAdvisory({
    renewableAvailability: 1,
    priority: 'normal',
  });

  assert.equal(none.opportunity, 'no-renewable-window');
  assert.equal(full.opportunity, 'renewable-window-available');
  assert.equal(none.safety.authoritative, false);
  assert.equal(full.safety.authoritative, false);
  assert.equal(none.safety.executesWorkload, false);
  assert.equal(full.safety.executesWorkload, false);
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
