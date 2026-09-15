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
  const result = await adapter[operation](scene);
  const safety = Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true });
  const dispatch = {
    sessionId: session.sessionId,
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
  if (!dispatch || typeof dispatch !== 'object' || typeof dispatch.dispatchFingerprint !== 'string') {
    return false;
  }

  const body = Object.fromEntries(
    Object.entries(dispatch).filter(([key]) => key !== 'dispatchFingerprint'),
  );
  return (
    /^[a-f0-9]{64}$/.test(dispatch.dispatchFingerprint) &&
    dispatch.dispatchFingerprint === fingerprintDispatch(body)
  );
}
