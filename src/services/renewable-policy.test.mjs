import {
  createRenewablePolicy,
  shouldPreferRenewableExecution,
} from './renewable-policy.mjs';
import { chooseExecutionStrategy } from './renewablePolicy.js';
import { selectExecutionMode } from './renewable-workload-policy.mjs';

describe('canonical renewable policy', () => {
  test('prefers renewable execution when configured and available', () => {
    const policy = createRenewablePolicy({ mode: 'renewable-preferred' });
    expect(shouldPreferRenewableExecution(policy, { renewableAvailable: true })).toBe(true);
    expect(shouldPreferRenewableExecution(policy, { renewableAvailable: true, urgent: true })).toBe(false);
  });

  test('keeps critical work immediate', () => {
    expect(chooseExecutionStrategy({ renewableAvailability: 1, urgency: 'critical' }).strategy).toBe('immediate');
    expect(selectExecutionMode({ renewableAvailability: 1, priority: 'critical' })).toBe('urgent');
  });

  test('legacy strategy still recognizes strong renewable availability', () => {
    const result = chooseExecutionStrategy({ renewableAvailability: 0.75 });
    expect(result.strategy).toBe('renewable-preferred');
  });
});
