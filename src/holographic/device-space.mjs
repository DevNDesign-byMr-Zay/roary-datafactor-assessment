export const DEVICE_SPACE_SCHEMA = 'holo.device-space.v1';

const AXIS_LIMITS = Object.freeze({ min: -100000, max: 100000 });

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
}

function point(value = {}, prefix = 'point') {
  return Object.freeze({
    x: finite(value.x ?? 0, `${prefix}.x`),
    y: finite(value.y ?? 0, `${prefix}.y`),
    z: finite(value.z ?? 0, `${prefix}.z`),
  });
}

function clampAxis(value) {
  return Math.min(AXIS_LIMITS.max, Math.max(AXIS_LIMITS.min, value));
}

export function createDeviceSpaceProfile({ deviceId, deviceType, origin = {}, scale = 1, bounds } = {}) {
  if (typeof deviceId !== 'string' || !deviceId.trim()) throw new TypeError('deviceId is required');
  if (!['projector', 'holomat', 'three-d-platform'].includes(deviceType)) throw new TypeError('Unsupported device type');
  finite(scale, 'scale');
  if (scale <= 0) throw new RangeError('scale must be positive');
  if (bounds !== undefined) {
    if (!bounds?.min || !bounds?.max) throw new TypeError('bounds require min and max points');
    const min = point(bounds.min, 'bounds.min');
    const max = point(bounds.max, 'bounds.max');
    if (min.x > max.x || min.y > max.y || min.z > max.z) throw new RangeError('bounds min must not exceed max');
    bounds = { min, max };
  }
  return Object.freeze({ schema: DEVICE_SPACE_SCHEMA, deviceId: deviceId.trim(), deviceType, origin: point(origin, 'origin'), scale, ...(bounds ? { bounds: Object.freeze(bounds) } : {}) });
}

export function mapScenePointToDeviceSpace(scenePoint, profile) {
  if (!profile || profile.schema !== DEVICE_SPACE_SCHEMA) throw new TypeError('A valid device-space profile is required');
  const source = point(scenePoint, 'scenePoint');
  const mapped = Object.freeze({
    x: clampAxis((source.x - profile.origin.x) * profile.scale),
    y: clampAxis((source.y - profile.origin.y) * profile.scale),
    z: clampAxis((source.z - profile.origin.z) * profile.scale),
  });
  if (profile.bounds && (mapped.x < profile.bounds.min.x || mapped.x > profile.bounds.max.x || mapped.y < profile.bounds.min.y || mapped.y > profile.bounds.max.y || mapped.z < profile.bounds.min.z || mapped.z > profile.bounds.max.z)) {
    throw new RangeError(`Point is outside device bounds for ${profile.deviceId}`);
  }
  return mapped;
}

export function createDeviceSpaceEvidence({ sceneId, deviceId, profile, sourcePoint, mappedPoint } = {}) {
  if (typeof sceneId !== 'string' || !sceneId.trim()) throw new TypeError('sceneId is required');
  if (!profile || profile.schema !== DEVICE_SPACE_SCHEMA) throw new TypeError('A valid device-space profile is required');
  const source = point(sourcePoint, 'sourcePoint');
  const mapped = mappedPoint ? point(mappedPoint, 'mappedPoint') : mapScenePointToDeviceSpace(source, profile);
  return Object.freeze({ schema: DEVICE_SPACE_SCHEMA, sceneId: sceneId.trim(), deviceId: profile.deviceId, deviceType: profile.deviceType, sourcePoint: source, mappedPoint: mapped });
}
