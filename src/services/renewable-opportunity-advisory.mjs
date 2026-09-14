const ADVISORY_VERSION = 1;
const VALID_PRIORITIES = Object.freeze(['normal', 'critical']);

function finiteRatio(value, name) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new TypeError(`${name} must be a finite number between 0 and 1`);
  }
  return value;
}

function windowMinutes(value) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError('renewableWindowMinutes must be a non-negative integer');
  }
  return value;
}

export function createRenewableOpportunityAdvisory({
  renewableAvailability = 0,
  priority = 'normal',
  renewableWindowMinutes = 0,
} = {}) {
  const availability = finiteRatio(renewableAvailability, 'renewableAvailability');
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new TypeError(`unsupported workload priority: ${priority}`);
  }
  const window = windowMinutes(renewableWindowMinutes);
  const available = availability >= 0.75 && priority !== 'critical';

  return Object.freeze({
    version: ADVISORY_VERSION,
    evidence: Object.freeze({
      renewableAvailability: availability,
      priority,
      renewableWindowMinutes: window,
    }),
    opportunity: available ? 'renewable-window-available' : 'no-renewable-window',
    reason: available
      ? 'reported renewable availability meets the advisory threshold for a non-critical workload'
      : priority === 'critical'
        ? 'critical workload priority prevents renewable-window advice'
        : 'reported renewable availability is below the advisory threshold',
    application: 'operator-or-runtime-policy-decision-required',
    safety: Object.freeze({
      advisoryOnly: true,
      authoritative: false,
      schedulesWorkload: false,
      delaysWorkload: false,
      executesWorkload: false,
      physicalActuation: false,
    }),
  });
}

export { ADVISORY_VERSION as RENEWABLE_OPPORTUNITY_ADVISORY_VERSION };
