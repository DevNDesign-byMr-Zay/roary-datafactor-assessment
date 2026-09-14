import { validateDisplaySession } from './display-session.mjs';

export async function dispatchHolographicDisplaySession({ session, adapter, operation = 'render' } = {}) {
  if (!validateDisplaySession(session)) throw new TypeError('invalid holographic display session');
  if (!adapter || typeof adapter !== 'object') throw new TypeError('adapter must be an object');
  if (typeof adapter[operation] !== 'function') throw new TypeError(`adapter operation not supported: ${operation}`);
  const result = await adapter[operation](session.packet.scene);
  return Object.freeze({
    sessionId: session.sessionId,
    sceneId: session.sceneId,
    operation,
    result,
    safety: Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true }),
  });
}
