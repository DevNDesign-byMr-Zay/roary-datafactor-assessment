import { createHolographicInteractionSession } from './interaction-session.mjs';
import { dispatchHolographicSurface } from './surface-dispatch.mjs';

/** Create a calibrated, interaction-aware session ready for a typed surface adapter. */
export function createHolographicSurfaceSession({ scene, calibrationProfile = null, events = [], sessionId } = {}) {
  return createHolographicInteractionSession({ scene, calibrationProfile, events, sessionId });
}

/** Validate the session boundary before dispatching to any supported surface. */
export async function dispatchHolographicSurfaceSession({ session, adapter } = {}) {
  const result = await dispatchHolographicSurface({ session, adapter });
  return Object.freeze({
    ...result,
    sessionId: session.sessionId,
    safety: Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true }),
  });
}
