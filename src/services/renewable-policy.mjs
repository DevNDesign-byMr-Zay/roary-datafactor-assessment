const VALID_MODES = Object.freeze(['renewable-preferred', 'balanced', 'urgent']);

export function createRenewablePolicy({ mode = 'balanced', renewableWindowMinutes = 0 } = {}) {
  if (!VALID_MODES.includes(mode)) {
    throw new Error(`Unsupported renewable policy mode: ${mode}`);
  }

  if (!Number.isInteger(renewableWindowMinutes) || renewableWindowMinutes < 0) {
    throw new Error('renewableWindowMinutes must be a non-negative integer');
  }

  return Object.freeze({
    mode,
    renewableWindowMinutes,
  });
}

export function shouldPreferRenewableExecution(policy, { renewableAvailable = false, urgent = false } = {}) {
  if (!policy || !VALID_MODES.includes(policy.mode)) {
    throw new Error('Invalid renewable policy');
  }

  if (urgent || policy.mode === 'urgent') return false;
  if (policy.mode === 'renewable-preferred') return renewableAvailable;
  return renewableAvailable && policy.mode === 'balanced';
}

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

export const RENEWABLE_POLICY_MODES = VALID_MODES;
