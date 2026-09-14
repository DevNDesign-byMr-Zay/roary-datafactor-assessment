export const EXECUTION_MODES = Object.freeze({
  IMMEDIATE: 'immediate',
  RENEWABLE_PREFERRED: 'renewable-preferred',
});

export function selectExecutionMode({ renewableAvailability = 0, priority = 'normal' }) {
  if (renewableAvailability >= 0.75 && priority !== 'critical') {
    return EXECUTION_MODES.RENEWABLE_PREFERRED;
  }

  return EXECUTION_MODES.IMMEDIATE;
}
