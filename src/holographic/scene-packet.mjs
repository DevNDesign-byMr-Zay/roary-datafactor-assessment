import { createHash } from 'node:crypto';
import { createScene } from './contracts.mjs';

const PACKET_VERSION = 1;
const INPUT_KEYS = Object.freeze(['scene', 'calibrationProfile', 'interactionEvents']);
const PACKET_KEYS = Object.freeze([
  'packetVersion',
  'scene',
  'calibrationProfile',
  'interactionEvents',
  'safety',
  'fingerprint',
]);
const SAFETY_KEYS = Object.freeze(['authoritative', 'physicalActuation', 'advisoryOnly']);
const AUTHORITY_FLAGS = Object.freeze([
  'authoritative',
  'actuatesHardware',
  'physicalActuation',
  'autoApply',
  'dispatchesInfrastructure',
  'deploysInfrastructure',
]);

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

function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value)), 'utf8').digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object') return value;
  for (const child of Object.values(value)) deepFreeze(child);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}

function snapshotEvidence(value, path = 'evidence', seen = new WeakSet()) {
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
      if (!descriptor.enumerable || 'get' in descriptor || 'set' in descriptor) {
        throw new TypeError(`${path}[${index}] must be enumerable data evidence`);
      }
      copy.push(snapshotEvidence(descriptor.value, `${path}[${index}]`, seen));
    }
    if (Reflect.ownKeys(value).some((key) => typeof key !== 'string' || !allowedKeys.has(key))) {
      throw new TypeError(`${path} arrays must not contain extra properties`);
    }
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must use plain objects`);
    }
    copy = {};
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (!descriptor.enumerable) throw new TypeError(`${path}.${key} must be enumerable evidence`);
      if ('get' in descriptor || 'set' in descriptor) {
        throw new TypeError(`${path}.${key} must not use accessors`);
      }
      Object.defineProperty(copy, key, {
        value: snapshotEvidence(descriptor.value, `${path}.${key}`, seen),
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }

  seen.delete(value);
  return copy;
}

function hasExactKeys(value, expected) {
  const keys = Object.keys(value);
  return keys.length === expected.length && keys.every((key) => expected.includes(key));
}

function rejectInteractionAuthority(event, path) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw new TypeError(`${path} must be an object`);
  }
  for (const flag of AUTHORITY_FLAGS) {
    if (event[flag] === true) {
      throw new TypeError(`${path}.${flag} must not grant execution authority`);
    }
  }
}

function captureInteractionEvents(value) {
  if (!Array.isArray(value)) throw new TypeError('interactionEvents must be an array.');
  return value.map((event, index) => {
    rejectInteractionAuthority(event, `interactionEvents[${index}]`);
    return {
      ...event,
      advisoryOnly: true,
      physicalActuation: false,
    };
  });
}

function safetyPolicy() {
  return {
    authoritative: false,
    physicalActuation: false,
    advisoryOnly: true,
  };
}

function packetBody(values) {
  return {
    packetVersion: values.packetVersion,
    scene: values.scene,
    calibrationProfile: values.calibrationProfile,
    interactionEvents: values.interactionEvents,
    safety: values.safety,
  };
}

export function createHolographicScenePacket(input = {}) {
  const values = snapshotEvidence(input, 'scene packet input');
  const unexpected = Object.keys(values).find((key) => !INPUT_KEYS.includes(key));
  if (unexpected) {
    throw new TypeError(`scene packet input contains unsupported field: ${unexpected}`);
  }
  if (!Object.hasOwn(values, 'scene')) throw new TypeError('scene is required.');

  const normalizedScene = createScene(values.scene);
  const calibrationProfile = Object.hasOwn(values, 'calibrationProfile')
    ? values.calibrationProfile
    : null;
  const interactionEvents = captureInteractionEvents(
    Object.hasOwn(values, 'interactionEvents') ? values.interactionEvents : [],
  );
  const payload = {
    packetVersion: PACKET_VERSION,
    scene: normalizedScene,
    calibrationProfile,
    interactionEvents,
    safety: safetyPolicy(),
  };

  return deepFreeze({ ...payload, fingerprint: fingerprint(payload) });
}

export function validateHolographicScenePacket(packet) {
  try {
    const values = snapshotEvidence(packet, 'scene packet');
    if (!hasExactKeys(values, PACKET_KEYS)) return false;
    if (values.packetVersion !== PACKET_VERSION) return false;
    if (typeof values.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(values.fingerprint)) {
      return false;
    }

    const normalizedScene = createScene(values.scene);
    if (JSON.stringify(canonical(normalizedScene)) !== JSON.stringify(canonical(values.scene))) {
      return false;
    }

    if (!Array.isArray(values.interactionEvents)) return false;
    for (let index = 0; index < values.interactionEvents.length; index += 1) {
      const event = values.interactionEvents[index];
      rejectInteractionAuthority(event, `interactionEvents[${index}]`);
      if (event.advisoryOnly !== true || event.physicalActuation !== false) return false;
    }

    if (!values.safety || typeof values.safety !== 'object' || Array.isArray(values.safety)) {
      return false;
    }
    if (!hasExactKeys(values.safety, SAFETY_KEYS)) return false;
    if (
      values.safety.authoritative !== false ||
      values.safety.physicalActuation !== false ||
      values.safety.advisoryOnly !== true
    ) {
      return false;
    }

    return values.fingerprint === fingerprint(packetBody(values));
  } catch {
    return false;
  }
}

export { PACKET_VERSION };
