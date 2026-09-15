import { describe, expect, test } from '@jest/globals';
import {
  createRenewablePolicy,
  shouldPreferRenewableExecution,
} from './renewable-policy.mjs';
import { chooseExecutionStrategy } from './renewablePolicy.js';
import { selectExecutionMode } from './renewable-workload-policy.mjs';
import { classifyWorkload } from './workload-classifier.mjs';
import { createDecisionTrace } from './decision-trace.mjs';
import { createRenewableDecision } from './renewable-decision-result.mjs';
import { summarizeWorkloadDecision } from './workload-decision-summary.mjs';

describe('canonical renewable policy', () => {
  test('prefers renewable execution only when policy and runtime evidence allow it', () => {
    const renewable = createRenewablePolicy({ mode: 'renewable-preferred', renewableWindowMinutes: 30 });
    const balanced = createRenewablePolicy();

    expect(renewable).toEqual({ mode: 'renewable-preferred', renewableWindowMinutes: 30 });
    expect(shouldPreferRenewableExecution(renewable, { renewableAvailable: true })).toBe(true);
    expect(shouldPreferRenewableExecution(renewable, { renewableAvailable: false })).toBe(false);
    expect(shouldPreferRenewableExecution(renewable, { renewableAvailable: true, urgent: true })).toBe(false);
    expect(shouldPreferRenewableExecution(balanced, { renewableAvailable: true })).toBe(true);
    expect(shouldPreferRenewableExecution(createRenewablePolicy({ mode: 'urgent' }), { renewableAvailable: true })).toBe(false);
  });

  test('rejects malformed policy configuration instead of normalizing it', () => {
    expect(() => createRenewablePolicy({ mode: 'unknown' })).toThrow(/Unsupported renewable policy mode/);
    expect(() => createRenewablePolicy({ renewableWindowMinutes: -1 })).toThrow(/non-negative integer/);
    expect(() => createRenewablePolicy({ renewableWindowMinutes: 1.5 })).toThrow(/non-negative integer/);
    expect(() => shouldPreferRenewableExecution({ mode: 'unknown' }, { renewableAvailable: true })).toThrow(/Invalid renewable policy/);
  });

  test('keeps critical work immediate and maps flexible work deterministically', () => {
    expect(chooseExecutionStrategy({ renewableAvailability: 1, urgency: 'critical' }).strategy).toBe('immediate');
    expect(chooseExecutionStrategy({ renewableAvailability: 0.75 }).strategy).toBe('renewable-preferred');
    expect(chooseExecutionStrategy({ renewableAvailability: 0.2 }).strategy).toBe('immediate');

    expect(selectExecutionMode({ renewableAvailability: 1, priority: 'critical' })).toBe('urgent');
    expect(selectExecutionMode({ renewableAvailability: 1 })).toBe('renewable-preferred');
    expect(selectExecutionMode({ renewableAvailability: 0.2 })).toBe('balanced');
  });

  test('classifies declared workload urgency without granting execution authority', () => {
    expect(classifyWorkload({ priority: 'critical' })).toBe('critical');
    expect(classifyWorkload({ deadlineSensitive: true })).toBe('critical');
    expect(classifyWorkload({ priority: 'normal', deadlineSensitive: false })).toBe('flexible');
  });

  test('builds immutable decision evidence and human-readable summaries', () => {
    const trace = createDecisionTrace({ workloadType: 'flexible', renewablePreferred: true });
    const decision = createRenewableDecision({
      workloadClass: 'flexible',
      renewablePreferred: true,
      reason: ' renewable window available ',
    });
    const summary = summarizeWorkloadDecision(decision);
    const standard = summarizeWorkloadDecision({
      workloadClass: 'critical',
      renewablePreferred: false,
      reason: 'latency first',
    });

    expect(trace).toEqual({
      workloadType: 'flexible',
      renewablePreferred: true,
      reason: 'policy-evaluated',
    });
    expect(Object.isFrozen(trace)).toBe(true);
    expect(decision.reason).toBe('renewable window available');
    expect(Object.isFrozen(decision)).toBe(true);
    expect(summary.summary).toContain('renewable preferred');
    expect(standard.summary).toContain('standard execution');
  });

  test('fails closed on malformed decision evidence', () => {
    expect(() => createDecisionTrace({ workloadType: '', renewablePreferred: true })).toThrow(/Invalid decision trace/);
    expect(() => createDecisionTrace({ workloadType: 'flexible', renewablePreferred: 'yes' })).toThrow(/Invalid decision trace/);
    expect(() => createRenewableDecision({ workloadClass: 'batch', renewablePreferred: true, reason: 'x' })).toThrow(/Unsupported workload class/);
    expect(() => createRenewableDecision({ workloadClass: 'flexible', renewablePreferred: 'yes', reason: 'x' })).toThrow(/renewablePreferred must be boolean/);
    expect(() => createRenewableDecision({ workloadClass: 'flexible', renewablePreferred: true, reason: ' ' })).toThrow(/Decision reason is required/);
    expect(() => summarizeWorkloadDecision({ workloadClass: 'batch', renewablePreferred: false, reason: 'x' })).toThrow(/Unsupported workload class/);
  });
});
