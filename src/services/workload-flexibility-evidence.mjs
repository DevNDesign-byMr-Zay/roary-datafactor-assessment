import { createHash } from 'node:crypto';

const EVIDENCE_VERSION = 1;
const VALID_PRIORITIES = Object.freeze(['normal', 'critical']);

function text(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
  return value.trim();
}

function nonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative integer`);
  }
  return value;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value)), 'utf8').digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function evidenceBody({
  workloadId,
  priority = 'normal',
  deferrable = false,
  maxDelayMinutes = 0,
  interruptible = false,
} = {}) {
  const id = text(workloadId, 'workloadId');
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new TypeError(`unsupported workload priority: ${priority}`);
  }
  if (typeof deferrable !== 'boolean') throw new TypeError('deferrable must be boolean');
  if (typeof interruptible !== 'boolean') throw new TypeError('interruptible must be boolean');
  const maxDelay = nonNegativeInteger(maxDelayMinutes, 'maxDelayMinutes');

  const critical = priority === 'critical';
  const flexible = !critical && deferrable && maxDelay > 0;

  return {
    version: EVIDENCE_VERSION,
    workloadId: id,
    declared: {
      priority,
      deferrable,
      maxDelayMinutes: maxDelay,
      interruptible,
    },
    classification: flexible ? 'flexible' : 'non-flexible',
    reason: critical
      ? 'critical priority is never classified as flexible'
      : !deferrable
        ? 'workload is not declared deferrable'
        : maxDelay === 0
          ? 'no deferral window is declared'
          : 'non-critical workload declares a positive deferral window',
    source: 'declared-runtime-metadata',
    interpretation: 'classification-evidence-only',
    safety: {
      advisoryOnly: true,
      authoritative: false,
      schedulesWorkload: false,
      delaysWorkload: false,
      interruptsWorkload: false,
      executesWorkload: false,
      physicalActuation: false,
    },
  };
}

export function createWorkloadFlexibilityEvidence(input) {
  const body = evidenceBody(input);
  return deepFreeze({
    ...body,
    evidenceFingerprint: fingerprint(body),
  });
}

export function validateWorkloadFlexibilityEvidence(evidence, source) {
  try {
    if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) return false;
    if (!/^[a-f0-9]{64}$/.test(evidence.evidenceFingerprint)) return false;
    const expectedBody = evidenceBody(source);
    const actualBody = Object.fromEntries(
      Object.entries(evidence).filter(([key]) => key !== 'evidenceFingerprint'),
    );
    if (JSON.stringify(canonical(actualBody)) !== JSON.stringify(canonical(expectedBody))) return false;
    return evidence.evidenceFingerprint === fingerprint(expectedBody);
  } catch {
    return false;
  }
}

export { EVIDENCE_VERSION as WORKLOAD_FLEXIBILITY_EVIDENCE_VERSION };
