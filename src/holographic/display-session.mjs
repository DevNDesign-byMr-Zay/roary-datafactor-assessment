import { createHash } from 'node:crypto';
import { createHolographicScenePacket, validateHolographicScenePacket } from './scene-packet.mjs';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function fingerprintSession({ sessionVersion, sessionId, sceneId, packet, safety }) {
  return createHash('sha256')
    .update(JSON.stringify(canonical({ sessionVersion, sessionId, sceneId, packet, safety })), 'utf8')
    .digest('hex');
}

export function createDisplaySession({ scene, calibrationProfile = null, interactionEvents = [], sessionId } = {}) {
  if (typeof sessionId !== 'string' || !sessionId.trim()) throw new TypeError('sessionId must be a non-empty string');
  const packet = createHolographicScenePacket({ scene, calibrationProfile, interactionEvents });
  const normalizedSessionId = sessionId.trim();
  const sceneId = packet.scene.id;
  const safety = Object.freeze({ authoritative: false, physicalActuation: false, advisoryOnly: true });
  const sessionFingerprint = fingerprintSession({ sessionVersion: 1, sessionId: normalizedSessionId, sceneId, packet, safety });
  return Object.freeze({ sessionVersion: 1, sessionId: normalizedSessionId, sceneId, packet, safety, sessionFingerprint });
}

export function validateDisplaySession(session) {
  try {
    if (!session || typeof session !== 'object' || Array.isArray(session)) return false;
    if (session.sessionVersion !== 1 || typeof session.sessionId !== 'string' || !session.sessionId.trim()) return false;
    if (!/^[a-f0-9]{64}$/.test(session.sessionFingerprint)) return false;
    if (session.safety?.authoritative !== false || session.safety?.physicalActuation !== false || session.safety?.advisoryOnly !== true) return false;
    if (!validateHolographicScenePacket(session.packet) || session.sceneId !== session.packet.scene.id) return false;
    return session.sessionFingerprint === fingerprintSession({
      sessionVersion: session.sessionVersion,
      sessionId: session.sessionId,
      sceneId: session.sceneId,
      packet: session.packet,
      safety: session.safety,
    });
  } catch { return false; }
}
