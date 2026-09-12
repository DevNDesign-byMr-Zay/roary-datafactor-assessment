import { createTransform } from './contracts.mjs';

const PROFILE_TYPES = Object.freeze(['projector', 'holomat', 'three-d-platform']);

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
  return value;
}

export function createCalibrationProfile({ type, origin = {}, scale = 1, rotation = {} } = {}) {
  if (!PROFILE_TYPES.includes(type)) throw new TypeError(`Unsupported calibration type: ${type}`);
  const transform = createTransform({
    x: origin.x ?? 0, y: origin.y ?? 0, z: origin.z ?? 0,
    rx: rotation.rx ?? 0, ry: rotation.ry ?? 0, rz: rotation.rz ?? 0,
    scale,
  });
  return Object.freeze({ type, transform });
}

export function mapPoint(point = {}, profile) {
  if (!profile || !PROFILE_TYPES.includes(profile.type)) throw new TypeError('A valid calibration profile is required.');
  const x = finite(point.x ?? 0, 'x');
  const y = finite(point.y ?? 0, 'y');
  const z = finite(point.z ?? 0, 'z');
  const { transform } = profile;
  return Object.freeze({
    x: transform.x + x * transform.scale,
    y: transform.y + y * transform.scale,
    z: transform.z + z * transform.scale,
  });
}

export function calibrateScene(scene, profile) {
  if (!scene || !Array.isArray(scene.nodes)) throw new TypeError('A valid holographic scene is required.');
  return Object.freeze({
    ...scene,
    nodes: Object.freeze(scene.nodes.map((node) => {
      const mapped = mapPoint(node.transform, profile);
      return Object.freeze({
        ...node,
        transform: Object.freeze({ ...node.transform, ...mapped }),
      });
    })),
    metadata: Object.freeze({ ...scene.metadata, calibrationType: profile.type }),
  });
}
