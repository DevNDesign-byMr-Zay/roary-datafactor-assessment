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

export const RENEWABLE_POLICY_MODES = VALID_MODES;
