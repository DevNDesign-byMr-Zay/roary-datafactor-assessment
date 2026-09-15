import { createHash } from 'node:crypto';
import { HolographicBatchDispatchError } from './verified-multi-surface-dispatch.mjs';

const FAILURE_EVIDENCE_VERSION = 1;
const FAILURE_KEYS = Object.freeze([
  'version',
  'sessionFingerprint',
  'phase',
  'failedIndex',
  'failedDeviceId',
  'failedDeviceType',
  'failureReason',
  'partialDispatches',
  'interpretation',
  'safety',
  'failureFingerprint',
]);
const PARTIAL_KEYS = Object.freeze([
  'dispatchFingerprint',
  'deviceId',
  'deviceType',
  'operation',
  'surfaceType',
]);
const SAFETY_KEYS = Object.freeze([
  'authoritative',
  'physicalActuation',
  'automaticRetry',
  'sealedSuccess',
]);

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  }
  return value;
}

function fingerprint(value) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)), 'utf8')
    .digest('hex');
}

function readExactDataObject(value, expectedKeys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (Object.getPrototypeOf(value) !== Object.prototype) return null;
  if (Object.getOwnPropertySymbols(value).length > 0) return null;

  const descriptors = Object.getOwnPropertyDescriptors(value);
  const actualKeys = Object.keys(descriptors).sort();
  const sortedExpected = [...expectedKeys].sort();
  if (
    actualKeys.length !== sortedExpected.length ||
    actualKeys.some((key, index) => key !== sortedExpected[index])
  ) {
    return null;
  }

  const copy = {};
  for (const key of sortedExpected) {
    const descriptor = descriptors[key];
    if (!descriptor || !descriptor.enumerable || 'get' in descriptor || 'set' in descriptor) {
      return null;
    }
    copy[key] = descriptor.value;
  }
  return copy;
}

function readExactArray(value, reader) {
  if (!Array.isArray(value)) return null;
  if (Object.getOwnPropertySymbols(value).length > 0) return null;
  const allowedKeys = new Set(['length']);
  const copy = [];
  for (let index = 0; index < value.length; index += 1) {
    const key = String(index);
    allowedKeys.add(key);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || 'get' in descriptor || 'set' in descriptor) return null;
    const entry = reader(descriptor.value);
    if (!entry) return null;
    copy.push(entry);
  }
  if (Reflect.ownKeys(value).some((key) => typeof key !== 'string' || !allowedKeys.has(key))) {
    return null;
  }
  return copy;
}

function nonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function readErrorField(error, key) {
  const descriptor = Object.getOwnPropertyDescriptor(error, key);
  if (!descriptor || 'get' in descriptor || 'set' in descriptor) {
    throw new TypeError(`batch failure field is not plain data: ${key}`);
  }
  return descriptor.value;
}

function partialDispatch(value) {
  const data = readExactDataObject(value, PARTIAL_KEYS);
  if (!data) return null;
  if (typeof data.dispatchFingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(data.dispatchFingerprint)) {
    return null;
  }
  for (const key of ['deviceId', 'deviceType', 'operation']) {
    if (!nonEmptyText(data[key])) return null;
  }
  if (data.surfaceType !== null && !nonEmptyText(data.surfaceType)) return null;
  return data;
}

function failureSafety() {
  return Object.freeze({
    authoritative: false,
    physicalActuation: false,
    automaticRetry: false,
    sealedSuccess: false,
  });
}

function failureBody(error) {
  if (!(error instanceof HolographicBatchDispatchError)) {
    throw new TypeError('typed holographic batch failure is required');
  }

  const partialDispatches = readExactArray(
    readErrorField(error, 'partialDispatches'),
    partialDispatch,
  );
  if (!partialDispatches) throw new TypeError('batch failure partial dispatch evidence is invalid');

  const body = {
    version: FAILURE_EVIDENCE_VERSION,
    sessionFingerprint: readErrorField(error, 'sessionFingerprint'),
    phase: readErrorField(error, 'phase'),
    failedIndex: readErrorField(error, 'failedIndex'),
    failedDeviceId: readErrorField(error, 'failedDeviceId'),
    failedDeviceType: readErrorField(error, 'failedDeviceType'),
    failureReason: readErrorField(error, 'failureReason'),
    partialDispatches: Object.freeze(partialDispatches.map((entry) => Object.freeze(entry))),
    interpretation: 'holographic-batch-partial-failure',
    safety: failureSafety(),
  };
  return Object.freeze(body);
}

export function createHolographicBatchFailureEvidence(error) {
  const body = failureBody(error);
  return Object.freeze({
    ...body,
    failureFingerprint: fingerprint(body),
  });
}

export function validateHolographicBatchFailureEvidence(evidence) {
  try {
    const data = readExactDataObject(evidence, FAILURE_KEYS);
    if (!data) return false;
    if (data.version !== FAILURE_EVIDENCE_VERSION) return false;
    if (data.phase !== 'dispatch' && data.phase !== 'seal') return false;
    if (typeof data.sessionFingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(data.sessionFingerprint)) {
      return false;
    }
    if (data.failedIndex !== null && (!Number.isInteger(data.failedIndex) || data.failedIndex < 0)) {
      return false;
    }
    if (data.failedDeviceId !== null && !nonEmptyText(data.failedDeviceId)) return false;
    if (data.failedDeviceType !== null && !nonEmptyText(data.failedDeviceType)) return false;
    if (!nonEmptyText(data.failureReason)) return false;
    if (data.interpretation !== 'holographic-batch-partial-failure') return false;
    if (typeof data.failureFingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(data.failureFingerprint)) {
      return false;
    }

    const partialDispatches = readExactArray(data.partialDispatches, partialDispatch);
    if (!partialDispatches) return false;
    const safety = readExactDataObject(data.safety, SAFETY_KEYS);
    if (!safety) return false;
    if (
      safety.authoritative !== false ||
      safety.physicalActuation !== false ||
      safety.automaticRetry !== false ||
      safety.sealedSuccess !== false
    ) {
      return false;
    }

    const body = {
      version: data.version,
      sessionFingerprint: data.sessionFingerprint,
      phase: data.phase,
      failedIndex: data.failedIndex,
      failedDeviceId: data.failedDeviceId,
      failedDeviceType: data.failedDeviceType,
      failureReason: data.failureReason,
      partialDispatches,
      interpretation: data.interpretation,
      safety,
    };
    return data.failureFingerprint === fingerprint(body);
  } catch {
    return false;
  }
}

export { FAILURE_EVIDENCE_VERSION as HOLOGRAPHIC_BATCH_FAILURE_EVIDENCE_VERSION };
