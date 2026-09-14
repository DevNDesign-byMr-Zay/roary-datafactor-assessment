import { expect, test } from '@jest/globals';

import { createRenewableOpportunityAdvisory } from '../src/services/renewable-opportunity-advisory.mjs';

test('surfaces a renewable opportunity without selecting or scheduling execution', () => {
  const advisory = createRenewableOpportunityAdvisory({
    renewableAvailability: 0.8,
    priority: 'normal',
    renewableWindowMinutes: 30,
  });

  expect(advisory.opportunity).toBe('renewable-window-available');
  expect(advisory.application).toBe('operator-or-runtime-policy-decision-required');
  expect(advisory.safety).toEqual({
    advisoryOnly: true,
    authoritative: false,
    schedulesWorkload: false,
    delaysWorkload: false,
    executesWorkload: false,
    physicalActuation: false,
  });
  expect(Object.isFrozen(advisory)).toBe(true);
  expect(Object.isFrozen(advisory.evidence)).toBe(true);
  expect(Object.isFrozen(advisory.safety)).toBe(true);
  expect(advisory).not.toHaveProperty('strategy');
  expect(advisory).not.toHaveProperty('shouldExecute');
  expect(advisory).not.toHaveProperty('executeAt');
});

test('treats the exact 0.75 boundary as an advisory opportunity for normal priority', () => {
  const advisory = createRenewableOpportunityAdvisory({
    renewableAvailability: 0.75,
    priority: 'normal',
    renewableWindowMinutes: 0,
  });

  expect(advisory.opportunity).toBe('renewable-window-available');
  expect(advisory.evidence.renewableAvailability).toBe(0.75);
  expect(advisory.evidence.renewableWindowMinutes).toBe(0);
  expect(advisory.safety.schedulesWorkload).toBe(false);
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

  expect(none.opportunity).toBe('no-renewable-window');
  expect(full.opportunity).toBe('renewable-window-available');
  expect(none.safety.authoritative).toBe(false);
  expect(full.safety.authoritative).toBe(false);
  expect(none.safety.executesWorkload).toBe(false);
  expect(full.safety.executesWorkload).toBe(false);
});

test('critical workloads suppress renewable-window advice without issuing an execution command', () => {
  const advisory = createRenewableOpportunityAdvisory({
    renewableAvailability: 1,
    priority: 'critical',
    renewableWindowMinutes: 60,
  });

  expect(advisory.opportunity).toBe('no-renewable-window');
  expect(advisory.reason).toMatch(/critical workload priority/);
  expect(advisory.safety.schedulesWorkload).toBe(false);
  expect(advisory.safety.delaysWorkload).toBe(false);
});

test('below-threshold evidence remains a no-op advisory', () => {
  const advisory = createRenewableOpportunityAdvisory({
    renewableAvailability: 0.74,
    priority: 'normal',
    renewableWindowMinutes: 15,
  });

  expect(advisory.opportunity).toBe('no-renewable-window');
  expect(advisory.reason).toMatch(/below the advisory threshold/);
});

test('rejects malformed availability, priority, and renewable windows', () => {
  for (const renewableAvailability of [-0.1, 1.1, Number.NaN, Number.POSITIVE_INFINITY]) {
    expect(() => createRenewableOpportunityAdvisory({ renewableAvailability })).toThrow(
      /renewableAvailability must be a finite number between 0 and 1/,
    );
  }

  expect(() => createRenewableOpportunityAdvisory({ priority: 'urgent' })).toThrow(
    /unsupported workload priority/,
  );
  expect(() => createRenewableOpportunityAdvisory({ renewableWindowMinutes: 1.5 })).toThrow(
    /renewableWindowMinutes must be a non-negative integer/,
  );
  expect(() => createRenewableOpportunityAdvisory({ renewableWindowMinutes: -1 })).toThrow(
    /renewableWindowMinutes must be a non-negative integer/,
  );
});
