import { createHash } from 'node:crypto';
import { validateDisplaySession } from './display-session.mjs';
import { mapSceneToDisplay } from './calibration.mjs';

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

function snapshotDispatchArray(value, path, seen) {
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new TypeError(`${path} must not contain symbol properties`);
  }

  const allowedKeys = new Set(['length']);
  const copy = [];
  for (let index = 0; index < value.length; index += 1) {
    const key = String(index);
    allowedKeys.add(key);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor) throw new TypeError(`${path} must not contain sparse arrays`);
    if ('get' in descriptor || 'set' in descriptor) {
      throw new TypeError(`${path}[${index}] must not use accessors`);
    }
    copy.push(snapshotDispatchEvidence(descriptor.value, `${path}[${index}]`, seen));
  }

  const unexpectedKey = Reflect.ownKeys(value).find(
    (key) => typeof key !== 'string' || !allowedKeys.has(key),
  );
  if (unexpectedKey !== undefined) {
    throw new TypeError(`${path} arrays must not contain extra properties`);
  }

  return Object.freeze(copy);
}

function snapshotDispatchObject(value, path, seen) {
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new TypeError(`${path} must not contain symbol properties`);
  }

  const copy = {};
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (!descriptor.enumerable) {
      throw new TypeError(`${path}.${key} must be enumerable evidence`);
    }
    if ('get' in descriptor || 'set' in descriptor) {
      throw new TypeError(`${path}.${key} must not use accessors`);
    }
    copy[key] = snapshotDispatchEvidence(descriptor.value, `${path}.${key}`, seen);
  }
  return Object.freeze(copy);
}

function snapshotDispatchEvidence(value, path = 'result', seen = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${path} numbers must be finite`);
    return value;
  }
  if (!value || typeof value !== 'object') {
    throw new TypeError(`${path} must contain JSON-compatible evidence`);
  }
  if (seen.has(value)) throw new TypeError(`${path} must not contain circular references`);
  seen.add(value);

  let copy;
  if (Array.isArray(value)) {
    copy = snapshotDispatchArray(value, path, seen);
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must use plain objects`);
    }
    copy = snapshotDispatchObject(value, path, seen);
  }

  seen.delete(value);
  return copy;
}

function fingerprintDispatch(value) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)), 'utf8')
    .digest('hex');
}

export async function dispatchHolographicDisplaySession({
  session,
  adapter,
  operation = 'render',
  surfaceType,
} = {}) {
  if (!validateDisplaySession(session)) throw new TypeError('invalid holographic display session');
  if (!adapter || typeof adapter !== 'object') throw new TypeError('adapter must be an object');
  if (typeof adapter[operation] !== 'function') {
    throw new TypeError(`adapter operation not supported: ${operation}`);
  }
  if (surfaceType !== undefined && (typeof surfaceType !== 'string' || !surfaceType.trim())) {
    throw new TypeError('surfaceType must be a non-empty string when provided');
  }

  const scene = session.packet.calibrationProfile
    ? mapSceneToDisplay(session.packet.scene, session.packet.calibrationProfile)
    : session.packet.scene;
  const result = snapshotDispatchEvidence(await adapter[operation](scene));
  const safety = safetyPolicy();
  const dispatch = {
    sessionId: session.sessionId,
    sessionFingerprint: session.sessionFingerprint,
    sourcePacketFingerprint: session.packet.fingerprint,
    sceneId: scene.id ?? scene.sceneId,
    operation,
    result,
    calibrated: Boolean(session.packet.calibrationProfile),
    ...(surfaceType === undefined ? {} : { surfaceType: surfaceType.trim() }),
    safety,
  };
  const dispatchFingerprint = fingerprintDispatch(dispatch);
  return Object.freeze({
    ...dispatch,
    dispatchFingerprint,
  });
}

export function verifyHolographicDispatchFingerprint(dispatch) {
  try {
    const normalized = snapshotDispatchEvidence(dispatch, 'dispatch');
    if (typeof normalized.dispatchFingerprint !== 'string') return false;
    if (!/^[a-f0-9]{64}$/.test(normalized.dispatchFingerprint)) return false;
    if (typeof normalized.sessionFingerprint !== 'string') return false;
    if (!/^[a-f0-9]{64}$/.test(normalized.sessionFingerprint)) return false;
    if (typeof normalized.sourcePacketFingerprint !== 'string') return false;
    if (!/^[a-f0-9]{64}$/.test(normalized.sourcePacketFingerprint)) return false;
    if (!hasExactSafetyPolicy(normalized.safety)) return false;

    const { dispatchFingerprint, ...body } = normalized;
    return dispatchFingerprint === fingerprintDispatch(body);
  } catch {
    return false;
  }
}

export function verifyHolographicDispatchAgainstSession(dispatch, session) {
  try {
    if (!verifyHolographicDispatchFingerprint(dispatch)) return false;
    if (!validateDisplaySession(session)) return false;
    const normalized = snapshotDispatchEvidence(dispatch, 'dispatch');

    return (
      normalized.sessionId === session.sessionId &&
      normalized.sceneId === session.sceneId &&
      normalized.sessionFingerprint === session.sessionFingerprint &&
      normalized.sourcePacketFingerprint === session.packet.fingerprint
    );
  } catch {
    return false;
  }
}
