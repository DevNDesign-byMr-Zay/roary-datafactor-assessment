import { createHolographicScenePacket, validateHolographicScenePacket } from './scene-packet.mjs';

export function createDisplaySession({ scene, calibrationProfile = null, interactionEvents = [], sessionId } = {}) {
  if (typeof sessionId !== 'string' || !sessionId.trim()) throw new TypeError('sessionId must be a non-empty string');
  const packet = createHolographicScenePacket({ scene, calibrationProfile, interactionEvents });
  return Object.freeze({
    sessionVersion: 1,
    sessionId: sessionId.trim(),
    sceneId: packet.scene.id,
    packet,
    safety: { authoritative: false, physicalActuation: false, advisoryOnly: true },
  });
}

export function validateDisplaySession(session) {
  try {
    if (!session || typeof session !== 'object' || Array.isArray(session)) return false;
    if (session.sessionVersion !== 1 || typeof session.sessionId !== 'string' || !session.sessionId.trim()) return false;
    if (session.safety?.authoritative !== false || session.safety?.physicalActuation !== false || session.safety?.advisoryOnly !== true) return false;
    return validateHolographicScenePacket(session.packet) && session.sceneId === session.packet.scene.id;
  } catch { return false; }
}
