import { createHash } from 'node:crypto';
import { createHolographicScenePacket, validateHolographicScenePacket } from './scene-packet.mjs';

const SESSION_VERSION = 1;
const SESSION_KEYS = Object.freeze([
  'sessionVersion',
  'sessionId',
  'sceneId',
  'packet',
  'safety',
  'sessionFingerprint',
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

function safetyPolicy() {
  return Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true });
}

function hasExactSafetyPolicy(safety) {
  return Boolean(
    safety &&
      typeof safety === 'object' &&
      !Array.isArray(safety) &&
      safety.authoritative === false &&
      safety.physicalActuation === false &&
      safety.advisoryOnly === true &&
      Object.keys(safety).length === 3,
  );
}

function snapshotSessionEvidence(value, path = 'session', seen = new WeakSet()) {
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
    const allowedKeys = new Set(['length']);
    copy = [];
    for (let index = 0; index < value.length; index += 1) {
      const key = String(index);
      allowedKeys.add(key);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor) throw new TypeError(`${path} must not contain sparse arrays`);
      if ('get' in descriptor || 'set' in descriptor) {
        throw new TypeError(`${path}[${index}] must not use accessors`);
      }
      copy.push(snapshotSessionEvidence(descriptor.value, `${path}[${index}]`, seen));
    }
    if (Reflect.ownKeys(value).some((key) => typeof key !== 'string' || !allowedKeys.has(key))) {
      throw new TypeError(`${path} arrays must not contain extra properties`);
    }
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must use plain objects`);
    }
    copy = {};
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (!descriptor.enumerable) throw new TypeError(`${path}.${key} must be enumerable evidence`);
      if ('get' in descriptor || 'set' in descriptor) {
        throw new TypeError(`${path}.${key} must not use accessors`);
      }
      Object.defineProperty(copy, key, {
        value: snapshotSessionEvidence(descriptor.value, `${path}.${key}`, seen),
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }

  seen.delete(value);
  return copy;
}

function sessionFingerprintBody({ sessionId, sceneId, packetFingerprint, safety }) {
  return {
    sessionVersion: SESSION_VERSION,
    sessionId,
    sceneId,
    packetFingerprint,
    safety,
  };
}

export function createDisplaySession({
  scene,
  calibrationProfile = null,
  interactionEvents = [],
  sessionId,
} = {}) {
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    throw new TypeError('sessionId must be a non-empty string');
  }
  const packet = createHolographicScenePacket({ scene, calibrationProfile, interactionEvents });
  const normalizedSessionId = sessionId.trim();
  const sceneId = packet.scene.sceneId;
  const safety = safetyPolicy();
  const body = sessionFingerprintBody({
    sessionId: normalizedSessionId,
    sceneId,
    packetFingerprint: packet.fingerprint,
    safety,
  });

  return Object.freeze({
    sessionVersion: SESSION_VERSION,
    sessionId: normalizedSessionId,
    sceneId,
    packet,
    safety,
    sessionFingerprint: fingerprint(body),
  });
}

export function validateDisplaySession(session) {
  try {
    const normalized = snapshotSessionEvidence(session);
    const keys = Object.keys(normalized);
    if (keys.length !== SESSION_KEYS.length || keys.some((key) => !SESSION_KEYS.includes(key))) {
      return false;
    }
    if (
      normalized.sessionVersion !== SESSION_VERSION ||
      typeof normalized.sessionId !== 'string' ||
      !normalized.sessionId.trim() ||
      typeof normalized.sceneId !== 'string' ||
      !normalized.sceneId.trim()
    ) {
      return false;
    }
    if (!hasExactSafetyPolicy(normalized.safety)) return false;
    if (!validateHolographicScenePacket(normalized.packet)) return false;
    if (normalized.sceneId !== normalized.packet.scene.sceneId) return false;
    if (typeof normalized.sessionFingerprint !== 'string') return false;
    if (!/^[a-f0-9]{64}$/.test(normalized.sessionFingerprint)) return false;

    const body = sessionFingerprintBody({
      sessionId: normalized.sessionId,
      sceneId: normalized.sceneId,
      packetFingerprint: normalized.packet.fingerprint,
      safety: normalized.safety,
    });
    return normalized.sessionFingerprint === fingerprint(body);
  } catch {
    return false;
  }
}

export { SESSION_VERSION as DISPLAY_SESSION_VERSION };
