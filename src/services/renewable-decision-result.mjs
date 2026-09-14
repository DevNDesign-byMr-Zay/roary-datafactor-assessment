export function createRenewableDecision({ workloadClass, renewablePreferred, reason } = {}) {
  if (workloadClass !== 'critical' && workloadClass !== 'flexible') {
    throw new Error('Unsupported workload class');
  }
  if (typeof renewablePreferred !== 'boolean') {
    throw new Error('renewablePreferred must be boolean');
  }
  if (typeof reason !== 'string' || reason.trim() === '') {
    throw new Error('Decision reason is required');
  }

  return Object.freeze({
    workloadClass,
    renewablePreferred,
    reason: reason.trim(),
  });
}
