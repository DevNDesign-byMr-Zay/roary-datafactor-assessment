import { shouldPreferRenewableExecution } from './renewable-policy.mjs';

export {
  createRenewablePolicy,
  shouldPreferRenewableExecution,
  RENEWABLE_POLICY_MODES,
} from './renewable-policy.mjs';

export function chooseExecutionStrategy({
  renewableAvailability = 0,
  urgency = 'normal',
} = {}) {
  const renewableAvailable = renewableAvailability >= 0.75;
  const policy = {
    mode: 'balanced',
  };

  if (urgency === 'critical') {
    return Object.freeze({
      strategy: 'immediate',
      reason: 'latency requirement prioritized',
    });
  }

  if (shouldPreferRenewableExecution(policy, { renewableAvailable })) {
    return Object.freeze({
      strategy: 'renewable-preferred',
      reason: 'flexible workload shifted toward cleaner energy availability',
    });
  }

  return Object.freeze({
    strategy: 'immediate',
    reason: 'latency requirement prioritized',
  });
}
