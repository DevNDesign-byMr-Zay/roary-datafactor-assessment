import { createHolographicInteractionSession, validateHolographicInteractionSession } from './interaction-session.mjs';
import { dispatchHolographicSurface } from './surface-dispatch.mjs';

/** Create a calibrated, interaction-aware session ready for a typed surface adapter. */
export function createHolographicSurfaceSession({ scene, calibrationProfile = null, events = [], sessionId } = {}) {
  return createHolographicInteractionSession({ scene, calibrationProfile, events, sessionId });
}

/** Validate the complete interaction/session boundary before dispatching to any surface. */
export async function dispatchHolographicSurfaceSession({ session, adapter } = {}) {
  if (!validateHolographicInteractionSession(session)) {
    throw new TypeError('invalid holographic surface session');
  }
  return dispatchHolographicSurface({ session: session.displaySession, adapter });
}
