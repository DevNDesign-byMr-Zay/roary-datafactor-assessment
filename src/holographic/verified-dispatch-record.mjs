import { createHash } from 'node:crypto';
import {
  verifyHolographicDispatchAgainstAdapter,
  verifyHolographicDispatchAgainstSession,
} from './display-dispatch.mjs';

const VERIFIED_DISPATCH_RECORD_VERSION = 1;
const RECORD_KEYS = Object.freeze([
  'version',
  'sessionId',
  'sceneId',
  'sessionFingerprint',
  'sourcePacketFingerprint',
  'dispatchFingerprint',
  'operation',
  'surfaceType',
  'adapterDevice',
  'verification',
  'safety',
  'recordFingerprint',
]);
const SAFETY_KEYS = Object.freeze(['advisoryOnly', 'authoritative', 'physicalActuation']);

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

function snapshotEvidence(value, path = 'evidence', seen = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${path} numbers must be finite`);
    return value;
  }
  if (!value || typeof value !== 'object') {
    throw new TypeError(`${path} must contain JSON-compatible evidence`);
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new TypeError(`${path} must not contain symbol properties`);
  }
  if (seen.has(value)) throw new TypeError(`${path} must not contain circular references`);
  seen.add(value);

  let copy;
  if (Array.isArray(value)) {
    copy = [];
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || 'get' in descriptor || 'set' in descriptor) {
        throw new TypeError(`${path}[${index}] must be plain data`);
      }
      copy.push(snapshotEvidence(descriptor.value, `${path}[${index}]`, seen));
    }
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must use plain objects`);
    }
    copy = {};
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (!descriptor.enumerable || 'get' in descriptor || 'set' in descriptor) {
        throw new TypeError(`${path}.${key} must be enumerable plain data`);
      }
      copy[key] = snapshotEvidence(descriptor.value, `${path}.${key}`, seen);
    }
  }

  seen.delete(value);
  return Object.freeze(copy);
}

function recordSafety() {
  return Object.freeze({
    advisoryOnly: true,
    authoritative: false,
    physicalActuation: false,
  });
}

function dispatchBody({ dispatch, session, adapter }) {
  if (!verifyHolographicDispatchAgainstSession(dispatch, session)) {
    throw new TypeError('dispatch does not match the verified display session');
  }
  if (!verifyHolographicDispatchAgainstAdapter(dispatch, adapter)) {
    throw new TypeError('dispatch does not match the verified adapter device');
  }
  if (!dispatch.adapterDevice) {
    throw new TypeError('verified adapter device identity is required');
  }

  return Object.freeze({
    version: VERIFIED_DISPATCH_RECORD_VERSION,
    sessionId: dispatch.sessionId,
    sceneId: dispatch.sceneId,
    sessionFingerprint: dispatch.sessionFingerprint,
    sourcePacketFingerprint: dispatch.sourcePacketFingerprint,
    dispatchFingerprint: dispatch.dispatchFingerprint,
    operation: dispatch.operation,
    surfaceType: dispatch.surfaceType ?? null,
    adapterDevice: snapshotEvidence(dispatch.adapterDevice, 'dispatch.adapterDevice'),
    verification: 'session-and-device-bound',
    safety: recordSafety(),
  });
}

export function createVerifiedHolographicDispatchRecord({ dispatch, session, adapter } = {}) {
  const body = dispatchBody({ dispatch, session, adapter });
  return Object.freeze({
    ...body,
    recordFingerprint: fingerprint(body),
  });
}

export function validateVerifiedHolographicDispatchRecord(
  record,
  { dispatch, session, adapter } = {},
) {
  try {
    const values = readExactDataObject(record, RECORD_KEYS);
    if (!values) return false;
    if (values.version !== VERIFIED_DISPATCH_RECORD_VERSION) return false;
    if (values.verification !== 'session-and-device-bound') return false;
    if (
      typeof values.recordFingerprint !== 'string' ||
      !/^[a-f0-9]{64}$/.test(values.recordFingerprint)
    ) {
      return false;
    }

    const safety = readExactDataObject(values.safety, SAFETY_KEYS);
    if (!safety) return false;
    if (
      safety.advisoryOnly !== true ||
      safety.authoritative !== false ||
      safety.physicalActuation !== false
    ) {
      return false;
    }

    const expected = dispatchBody({ dispatch, session, adapter });
    for (const key of RECORD_KEYS) {
      if (key === 'recordFingerprint' || key === 'adapterDevice' || key === 'safety') continue;
      if (values[key] !== expected[key]) return false;
    }
    if (JSON.stringify(canonical(values.adapterDevice)) !== JSON.stringify(canonical(expected.adapterDevice))) {
      return false;
    }
    if (SAFETY_KEYS.some((key) => safety[key] !== expected.safety[key])) return false;
    return values.recordFingerprint === fingerprint(expected);
  } catch {
    return false;
  }
}

export { VERIFIED_DISPATCH_RECORD_VERSION };
