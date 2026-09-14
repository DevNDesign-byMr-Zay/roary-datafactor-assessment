export {
  RENEWABLE_POLICY_MODES as EXECUTION_MODES,
  shouldPreferRenewableExecution,
} from './renewable-policy.mjs';

export function selectExecutionMode({ renewableAvailability = 0, priority = 'normal' } = {}) {
  if (priority === 'critical') {
    return 'urgent';
  }

  const renewableAvailable = renewableAvailability >= 0.75;
  return renewableAvailable ? 'renewable-preferred' : 'balanced';
}
