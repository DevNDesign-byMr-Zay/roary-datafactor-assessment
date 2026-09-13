import { createHolographicInteractionEvent, resolveHolographicInteraction } from './interaction.mjs';
import { createDisplaySession, validateDisplaySession } from './display-session.mjs';

export function createHolographicInteractionSession({ scene, calibrationProfile = null, events = [], sessionId } = {}) {
  const normalizedEvents = events.map((event) => createHolographicInteractionEvent(event));
  const displaySession = createDisplaySession({ scene, calibrationProfile, interactionEvents: normalizedEvents, sessionId });
  return Object.freeze({
    sessionVersion: 1,
    sessionId: displaySession.sessionId,
    displaySession,
    events: normalizedEvents,
    safety: { advisoryOnly: true, authoritative: false, physicalActuation: false },
  });
}

export function validateHolographicInteractionSession(session) {
  if (!session || typeof session !== 'object') return false;
  if (session.sessionVersion !== 1) return false;
  if (!validateDisplaySession(session.displaySession)) return false;
  if (!Array.isArray(session.events)) return false;
  if (session.displaySession.sessionId !== session.sessionId) return false;
  if (session.safety?.advisoryOnly !== true || session.safety?.authoritative !== false || session.safety?.physicalActuation !== false) return false;
  try {
    session.events.forEach((event) => createHolographicInteractionEvent(event));
  } catch {
    return false;
  }
  return true;
}

export function resolveInteractionSessionEvent({ scene, session, event } = {}) {
  if (!validateHolographicInteractionSession(session)) throw new TypeError('invalid holographic interaction session');
  const normalized = createHolographicInteractionEvent(event);
  return resolveHolographicInteraction(scene, normalized);
}
