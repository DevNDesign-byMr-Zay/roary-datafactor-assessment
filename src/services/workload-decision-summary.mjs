export function summarizeWorkloadDecision({ workloadClass, renewablePreferred, reason } = {}) {
  if (!['critical', 'flexible'].includes(workloadClass)) {
    throw new Error('Unsupported workload class');
  }

  return Object.freeze({
    summary: `${workloadClass} workload: ${renewablePreferred ? 'renewable preferred' : 'standard execution'} (${reason})`,
    workloadClass,
    renewablePreferred,
    reason,
  });
}
