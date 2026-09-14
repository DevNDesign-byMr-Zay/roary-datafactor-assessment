import { validateDisplaySession } from './display-session.mjs';
import { mapSceneToDisplay } from './calibration.mjs';

export async function dispatchHolographicDisplaySession({ session, adapter, operation = 'render' } = {}) {
  if (!validateDisplaySession(session)) throw new TypeError('invalid holographic display session');
  if (!adapter || typeof adapter !== 'object') throw new TypeError('adapter must be an object');
  if (typeof adapter[operation] !== 'function') throw new TypeError(`adapter operation not supported: ${operation}`);
  const scene = session.packet.calibrationProfile
    ? mapSceneToDisplay(session.packet.scene, session.packet.calibrationProfile)
    : session.packet.scene;
  const result = await adapter[operation](scene);
  return Object.freeze({
    sessionId: session.sessionId,
    sceneId: session.sceneId,
    operation,
    result,
    calibrated: Boolean(session.packet.calibrationProfile),
    safety: Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true }),
  });
}
