import { createHash } from 'node:crypto';
import { createScene } from './contracts.mjs';

const PACKET_VERSION = 1;

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value)), 'utf8').digest('hex');
}

export function createHolographicScenePacket({ scene, calibrationProfile = null, interactionEvents = [] } = {}) {
  if (!scene || typeof scene !== 'object') throw new TypeError('scene is required.');
  const normalizedScene = createScene(scene);
  if (!Array.isArray(interactionEvents)) throw new TypeError('interactionEvents must be an array.');
  const payload = {
    packetVersion: PACKET_VERSION,
    scene: normalizedScene,
    calibrationProfile: calibrationProfile ?? null,
    interactionEvents: interactionEvents.map((event) => ({ ...event, advisoryOnly: true, physicalActuation: false })),
    safety: { authoritative: false, physicalActuation: false, advisoryOnly: true },
  };
  return Object.freeze({ ...payload, fingerprint: fingerprint(payload) });
}

export function validateHolographicScenePacket(packet) {
  try {
    if (!packet || typeof packet !== 'object' || packet.packetVersion !== PACKET_VERSION) return false;
    if (!packet.scene || typeof packet.scene.id !== 'string' || !Array.isArray(packet.scene.nodes)) return false;
    if (!Array.isArray(packet.interactionEvents)) return false;
    if (packet.interactionEvents.some((event) => event.advisoryOnly !== true || event.physicalActuation !== false)) return false;
    if (packet.safety?.authoritative !== false || packet.safety?.physicalActuation !== false || packet.safety?.advisoryOnly !== true) return false;
    return packet.fingerprint === fingerprint({ packetVersion: packet.packetVersion, scene: packet.scene, calibrationProfile: packet.calibrationProfile ?? null, interactionEvents: packet.interactionEvents, safety: packet.safety });
  } catch {
    return false;
  }
}

export { PACKET_VERSION };
