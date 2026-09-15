import { createHolographicInteractionEvent, resolveHolographicInteraction } from './interaction.mjs';
import { createDisplaySession, validateDisplaySession } from './display-session.mjs';

const SESSION_KEYS = Object.freeze([
  'sessionVersion',
  'sessionId',
  'displaySession',
  'packet',
  'events',
  'safety',
]);
const SAFETY_KEYS = Object.freeze(['advisoryOnly', 'authoritative', 'physicalActuation']);

function snapshotEvidence(value, path = 'interactionSession', seen = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${path} numbers must be finite`);
    return value;
  }
  if (!value || typeof value !== 'object') {
    throw new TypeError(`${path} must contain JSON-compatible evidence`);
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new TypeError(`${path} must not contain symbol properties`);
  }
  if (seen.has(value)) throw new TypeError(`${path} must not contain circular references`);
  seen.add(value);

  let copy;
  if (Array.isArray(value)) {
    const allowedKeys = new Set(['length']);
    copy = [];
    for (let index = 0; index < value.length; index += 1) {
      const key = String(index);
      allowedKeys.add(key);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor) throw new TypeError(`${path} must not contain sparse arrays`);
      if ('get' in descriptor || 'set' in descriptor) {
        throw new TypeError(`${path}[${index}] must not use accessors`);
      }
      copy.push(snapshotEvidence(descriptor.value, `${path}[${index}]`, seen));
    }
    if (Reflect.ownKeys(value).some((key) => typeof key !== 'string' || !allowedKeys.has(key))) {
      throw new TypeError(`${path} arrays must not contain extra properties`);
    }
  } else {
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      throw new TypeError(`${path} must use plain objects`);
    }
    copy = {};
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (!descriptor.enumerable) throw new TypeError(`${path}.${key} must be enumerable evidence`);
      if ('get' in descriptor || 'set' in descriptor) {
        throw new TypeError(`${path}.${key} must not use accessors`);
      }
      copy[key] = snapshotEvidence(descriptor.value, `${path}.${key}`, seen);
    }
  }

  seen.delete(value);
  return copy;
}

function hasExactKeys(value, expected) {
  const keys = Object.keys(value);
  return keys.length === expected.length && keys.every((key) => expected.includes(key));
}

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

function sameEvidence(left, right) {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

export function createHolographicInteractionSession({
  scene,
  calibrationProfile = null,
  events,
  interactionEvents,
  sessionId,
} = {}) {
  const sourceEvents = snapshotEvidence(events ?? interactionEvents ?? [], 'events');
  if (!Array.isArray(sourceEvents)) throw new TypeError('events must be an array');
  const normalizedEvents = Object.freeze(
    sourceEvents.map((event) => createHolographicInteractionEvent(event)),
  );
  const displaySession = createDisplaySession({
    scene,
    calibrationProfile,
    interactionEvents: normalizedEvents,
    sessionId,
  });
  return Object.freeze({
    sessionVersion: 1,
    sessionId: displaySession.sessionId,
    displaySession,
    packet: displaySession.packet,
    events: normalizedEvents,
    safety: Object.freeze({ advisoryOnly: true, authoritative: false, physicalActuation: false }),
  });
}

export function validateHolographicInteractionSession(session) {
  try {
    const normalized = snapshotEvidence(session);
    if (!hasExactKeys(normalized, SESSION_KEYS)) return false;
    if (
      normalized.sessionVersion !== 1 ||
      typeof normalized.sessionId !== 'string' ||
      !normalized.sessionId.trim() ||
      !Array.isArray(normalized.events)
    ) {
      return false;
    }
    if (!validateDisplaySession(normalized.displaySession)) return false;
    if (normalized.displaySession.sessionId !== normalized.sessionId) return false;
    if (!sameEvidence(normalized.packet, normalized.displaySession.packet)) return false;
    if (!sameEvidence(normalized.events, normalized.displaySession.packet.interactionEvents)) return false;
    if (!hasExactKeys(normalized.safety, SAFETY_KEYS)) return false;
    if (
      normalized.safety.advisoryOnly !== true ||
      normalized.safety.authoritative !== false ||
      normalized.safety.physicalActuation !== false
    ) {
      return false;
    }
    for (const event of normalized.events) {
      if (!sameEvidence(event, createHolographicInteractionEvent(event))) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function resolveInteractionSessionEvent({ scene, session, event } = {}) {
  if (!validateHolographicInteractionSession(session))
    throw new TypeError('invalid holographic interaction session');
  const normalized = createHolographicInteractionEvent(event);
  return resolveHolographicInteraction(scene, normalized);
}
