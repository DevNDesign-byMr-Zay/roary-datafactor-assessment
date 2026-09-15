export function createDecisionTrace({ workloadType, renewablePreferred, reason }) {
  if (!workloadType || typeof renewablePreferred !== 'boolean') {
    throw new Error('Invalid decision trace');
  }

  return Object.freeze({
    workloadType,
    renewablePreferred,
    reason: reason || 'policy-evaluated',
  });
}
