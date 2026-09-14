import { expect, test } from '@jest/globals';

import {
  createWorkloadFlexibilityEvidence,
  validateWorkloadFlexibilityEvidence,
} from '../src/services/workload-flexibility-evidence.mjs';

function source(overrides = {}) {
  return {
    workloadId: 'workload-1',
    priority: 'normal',
    deferrable: true,
    maxDelayMinutes: 30,
    interruptible: false,
    ...overrides,
  };
}

test('classifies explicit non-critical deferrable metadata as flexibility evidence only', () => {
  const input = source();
  const evidence = createWorkloadFlexibilityEvidence(input);

  expect(evidence.workloadId).toBe('workload-1');
  expect(evidence.classification).toBe('flexible');
  expect(evidence.declared).toEqual({
    priority: 'normal',
    deferrable: true,
    maxDelayMinutes: 30,
    interruptible: false,
  });
  expect(evidence.source).toBe('declared-runtime-metadata');
  expect(evidence.interpretation).toBe('classification-evidence-only');
  expect(evidence.safety).toEqual({
    advisoryOnly: true,
    authoritative: false,
    schedulesWorkload: false,
    delaysWorkload: false,
    interruptsWorkload: false,
    executesWorkload: false,
    physicalActuation: false,
  });
  expect(evidence).not.toHaveProperty('executeAt');
  expect(evidence).not.toHaveProperty('queue');
  expect(validateWorkloadFlexibilityEvidence(evidence, input)).toBe(true);
});

test('critical priority is never classified as flexible even with a deferral declaration', () => {
  const input = source({ priority: 'critical', maxDelayMinutes: 120 });
  const evidence = createWorkloadFlexibilityEvidence(input);

  expect(evidence.classification).toBe('non-flexible');
  expect(evidence.reason).toMatch(/critical priority/);
  expect(evidence.safety.delaysWorkload).toBe(false);
});

test('requires both explicit deferrability and a positive delay window', () => {
  expect(createWorkloadFlexibilityEvidence(source({ deferrable: false })).classification).toBe(
    'non-flexible',
  );
  expect(createWorkloadFlexibilityEvidence(source({ maxDelayMinutes: 0 })).classification).toBe(
    'non-flexible',
  );
});

test('records interruptibility as evidence without granting interruption authority', () => {
  const evidence = createWorkloadFlexibilityEvidence(source({ interruptible: true }));

  expect(evidence.declared.interruptible).toBe(true);
  expect(evidence.safety.interruptsWorkload).toBe(false);
});

test('rejects malformed identity, priority, booleans, and delay windows', () => {
  expect(() => createWorkloadFlexibilityEvidence(source({ workloadId: '   ' }))).toThrow(
    /workloadId must be a non-empty string/,
  );
  expect(() => createWorkloadFlexibilityEvidence(source({ priority: 'urgent' }))).toThrow(
    /unsupported workload priority/,
  );
  expect(() => createWorkloadFlexibilityEvidence(source({ deferrable: 'yes' }))).toThrow(
    /deferrable must be boolean/,
  );
  expect(() => createWorkloadFlexibilityEvidence(source({ interruptible: 1 }))).toThrow(
    /interruptible must be boolean/,
  );
  expect(() => createWorkloadFlexibilityEvidence(source({ maxDelayMinutes: -1 }))).toThrow(
    /maxDelayMinutes must be a non-negative integer/,
  );
  expect(() => createWorkloadFlexibilityEvidence(source({ maxDelayMinutes: 1.5 }))).toThrow(
    /maxDelayMinutes must be a non-negative integer/,
  );
});

test('evidence identity is deterministic, immutable, and tamper-evident', () => {
  const input = source();
  const first = createWorkloadFlexibilityEvidence(input);
  const second = createWorkloadFlexibilityEvidence(input);

  expect(first.evidenceFingerprint).toBe(second.evidenceFingerprint);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.declared)).toBe(true);
  expect(Object.isFrozen(first.safety)).toBe(true);
  expect(
    validateWorkloadFlexibilityEvidence(
      { ...first, classification: 'non-flexible' },
      input,
    ),
  ).toBe(false);
  expect(
    validateWorkloadFlexibilityEvidence(
      { ...first, safety: { ...first.safety, schedulesWorkload: true } },
      input,
    ),
  ).toBe(false);
});
