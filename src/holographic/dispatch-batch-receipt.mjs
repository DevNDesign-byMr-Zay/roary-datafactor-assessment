import { createHash } from 'node:crypto';
import { validateDisplaySession } from './display-session.mjs';
import {
  createVerifiedHolographicDispatchRecord,
  validateVerifiedHolographicDispatchRecord,
} from './verified-dispatch-record.mjs';

const DISPATCH_BATCH_VERSION = 1;
const RECEIPT_KEYS = Object.freeze([
  'version',
  'sessionId',
  'sessionFingerprint',
  'sourcePacketFingerprint',
  'sceneId',
  'dispatchCount',
  'dispatches',
  'interpretation',
  'safety',
  'batchFingerprint',
]);
const ENTRY_KEYS = Object.freeze([
  'recordFingerprint',
  'dispatchFingerprint',
  'deviceId',
  'deviceType',
  'operation',
  'surfaceType',
]);
const SAFETY_KEYS = Object.freeze(['authoritative', 'physicalActuation', 'advisoryOnly']);

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

function readExactArray(value) {
  if (!Array.isArray(value)) return null;
  if (Object.getOwnPropertySymbols(value).length > 0) return null;
  const allowedKeys = new Set(['length']);
  const copy = [];
  for (let index = 0; index < value.length; index += 1) {
    const key = String(index);
    allowedKeys.add(key);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || 'get' in descriptor || 'set' in descriptor) return null;
    copy.push(descriptor.value);
  }
  if (Reflect.ownKeys(value).some((key) => typeof key !== 'string' || !allowedKeys.has(key))) {
    return null;
  }
  return copy;
}

function safetyPolicy() {
  return Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true });
}

function recordEntry(record) {
  return Object.freeze({
    recordFingerprint: record.recordFingerprint,
    dispatchFingerprint: record.dispatchFingerprint,
    deviceId: record.adapterDevice.id,
    deviceType: record.adapterDevice.type,
    operation: record.operation,
    surfaceType: record.surfaceType,
  });
}

function validatedEntries({ session, dispatches, adapters }) {
  if (!validateDisplaySession(session)) throw new TypeError('validated display session is required');
  if (!Array.isArray(dispatches) || dispatches.length === 0) {
    throw new TypeError('at least one dispatch is required');
  }
  if (!Array.isArray(adapters) || adapters.length !== dispatches.length) {
    throw new TypeError('one adapter is required for every dispatch');
  }

  const entries = [];
  const recordFingerprints = new Set();
  const dispatchFingerprints = new Set();
  const deviceIds = new Set();
  for (let index = 0; index < dispatches.length; index += 1) {
    const dispatch = dispatches[index];
    const adapter = adapters[index];
    const record = createVerifiedHolographicDispatchRecord({ dispatch, session, adapter });
    if (!validateVerifiedHolographicDispatchRecord(record, { dispatch, session, adapter })) {
      throw new TypeError(`dispatch ${index} failed verified record validation`);
    }

    const entry = recordEntry(record);
    if (recordFingerprints.has(entry.recordFingerprint)) {
      throw new TypeError('duplicate dispatch records are not allowed');
    }
    if (dispatchFingerprints.has(entry.dispatchFingerprint)) {
      throw new TypeError('duplicate dispatch fingerprints are not allowed');
    }
    if (deviceIds.has(entry.deviceId)) {
      throw new TypeError('duplicate device identities are not allowed');
    }
    recordFingerprints.add(entry.recordFingerprint);
    dispatchFingerprints.add(entry.dispatchFingerprint);
    deviceIds.add(entry.deviceId);
    entries.push(entry);
  }

  return Object.freeze(entries);
}

function receiptBody({ session, entries }) {
  return Object.freeze({
    version: DISPATCH_BATCH_VERSION,
    sessionId: session.sessionId,
    sessionFingerprint: session.sessionFingerprint,
    sourcePacketFingerprint: session.packet.fingerprint,
    sceneId: session.sceneId,
    dispatchCount: entries.length,
    dispatches: Object.freeze([...entries]),
    interpretation: 'verified-multi-surface-dispatch-batch',
    safety: safetyPolicy(),
  });
}

export function createHolographicDispatchBatchReceipt({ session, dispatches, adapters } = {}) {
  const entries = validatedEntries({ session, dispatches, adapters });
  const body = receiptBody({ session, entries });
  return Object.freeze({ ...body, batchFingerprint: fingerprint(body) });
}

export function validateHolographicDispatchBatchReceipt(
  receipt,
  { session, dispatches, adapters } = {},
) {
  try {
    const values = readExactDataObject(receipt, RECEIPT_KEYS);
    if (!values) return false;
    if (values.version !== DISPATCH_BATCH_VERSION) return false;
    if (values.interpretation !== 'verified-multi-surface-dispatch-batch') return false;
    if (!Number.isInteger(values.dispatchCount) || values.dispatchCount <= 0) return false;
    if (
      typeof values.batchFingerprint !== 'string' ||
      !/^[a-f0-9]{64}$/.test(values.batchFingerprint)
    ) {
      return false;
    }

    const safety = readExactDataObject(values.safety, SAFETY_KEYS);
    if (!safety) return false;
    if (
      safety.authoritative !== false ||
      safety.physicalActuation !== false ||
      safety.advisoryOnly !== true
    ) {
      return false;
    }

    const storedEntries = readExactArray(values.dispatches);
    if (!storedEntries || storedEntries.length !== values.dispatchCount) return false;
    for (const storedEntry of storedEntries) {
      const entry = readExactDataObject(storedEntry, ENTRY_KEYS);
      if (!entry) return false;
      for (const candidate of [entry.recordFingerprint, entry.dispatchFingerprint]) {
        if (typeof candidate !== 'string' || !/^[a-f0-9]{64}$/.test(candidate)) return false;
      }
      if (typeof entry.deviceId !== 'string' || !entry.deviceId.trim()) return false;
      if (typeof entry.deviceType !== 'string' || !entry.deviceType.trim()) return false;
      if (typeof entry.operation !== 'string' || !entry.operation.trim()) return false;
      if (
        entry.surfaceType !== null &&
        (typeof entry.surfaceType !== 'string' || !entry.surfaceType.trim())
      ) {
        return false;
      }
    }

    const expectedEntries = validatedEntries({ session, dispatches, adapters });
    if (expectedEntries.length !== storedEntries.length) return false;
    for (let index = 0; index < expectedEntries.length; index += 1) {
      if (
        JSON.stringify(canonical(storedEntries[index])) !==
        JSON.stringify(canonical(expectedEntries[index]))
      ) {
        return false;
      }
    }

    const body = receiptBody({ session, entries: expectedEntries });
    if (
      values.sessionId !== body.sessionId ||
      values.sessionFingerprint !== body.sessionFingerprint ||
      values.sourcePacketFingerprint !== body.sourcePacketFingerprint ||
      values.sceneId !== body.sceneId ||
      values.dispatchCount !== body.dispatchCount
    ) {
      return false;
    }
    return values.batchFingerprint === fingerprint(body);
  } catch {
    return false;
  }
}

export { DISPATCH_BATCH_VERSION as HOLOGRAPHIC_DISPATCH_BATCH_VERSION };
