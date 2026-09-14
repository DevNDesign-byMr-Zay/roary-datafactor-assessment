import { createHolographicInteractionSession, validateHolographicInteractionSession } from './interaction-session.mjs';
import { dispatchHolographicSurface } from './surface-dispatch.mjs';

/** Create a calibrated, interaction-aware session ready for a typed surface adapter. */
export function createHolographicSurfaceSession({ scene, calibrationProfile = null, events = [], sessionId } = {}) {
  return createHolographicInteractionSession({ scene, calibrationProfile, events, sessionId });
}

/** Validate the interaction-aware wrapper before dispatching its display session. */
export async function dispatchHolographicSurfaceSession({ session, adapter } = {}) {
  if (!validateHolographicInteractionSession(session)) {
    throw new TypeError('invalid holographic surface session');
  }
  const result = await dispatchHolographicSurface({ session: session.displaySession, adapter });
  return Object.freeze({
    ...result,
    sessionId: session.sessionId,
    safety: Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true }),
  });
}
