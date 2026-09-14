import { createHash } from 'node:crypto';
import { validateDisplaySession } from './display-session.mjs';
import { mapSceneToDisplay } from './calibration.mjs';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}

function snapshotDispatchEvidence(value, name = 'adapter result', seen = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${name} numbers must be finite`);
    return value;
  }
  if (!value || typeof value !== 'object') {
    throw new TypeError(`${name} must contain JSON-compatible evidence`);
  }
  if (seen.has(value)) throw new TypeError(`${name} must not contain circular references`);
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${name} must contain plain JSON-compatible evidence`);
  }

  seen.add(value);
  const copy = Array.isArray(value)
    ? value.map((child, index) => snapshotDispatchEvidence(child, `${name}[${index}]`, seen))
    : Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          snapshotDispatchEvidence(child, `${name}.${key}`, seen),
        ]),
      );
  seen.delete(value);
  return copy;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function dispatchFingerprintBody(dispatch) {
  return Object.fromEntries(
    Object.entries(dispatch).filter(([key]) => key !== 'dispatchFingerprint'),
  );
}

export function fingerprintHolographicDispatch(dispatch) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(dispatchFingerprintBody(dispatch))), 'utf8')
    .digest('hex');
}

export async function dispatchHolographicDisplaySession({ session, adapter, operation = 'render' } = {}) {
  if (!validateDisplaySession(session)) throw new TypeError('invalid holographic display session');
  if (!adapter || typeof adapter !== 'object') throw new TypeError('adapter must be an object');
  if (typeof adapter[operation] !== 'function') throw new TypeError(`adapter operation not supported: ${operation}`);
  const scene = session.packet.calibrationProfile
    ? mapSceneToDisplay(session.packet.scene, session.packet.calibrationProfile)
    : session.packet.scene;
  const result = deepFreeze(snapshotDispatchEvidence(await adapter[operation](scene)));
  const dispatch = {
    sessionId: session.sessionId,
    sceneId: session.sceneId,
    operation,
    result,
    calibrated: Boolean(session.packet.calibrationProfile),
    safety: Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true }),
  };
  const dispatchFingerprint = fingerprintHolographicDispatch(dispatch);
  return deepFreeze({
    ...dispatch,
    dispatchFingerprint,
  });
}

export function verifyHolographicDispatchFingerprint(dispatch) {
  if (!dispatch || typeof dispatch !== 'object' || typeof dispatch.dispatchFingerprint !== 'string') return false;
  return /^[a-f0-9]{64}$/.test(dispatch.dispatchFingerprint)
    && dispatch.dispatchFingerprint === fingerprintHolographicDispatch(dispatch);
}
