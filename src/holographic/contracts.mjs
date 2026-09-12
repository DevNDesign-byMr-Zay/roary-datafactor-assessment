const DEVICE_TYPES = Object.freeze(['projector', 'holomat', 'three-d-platform']);

function finiteNumber(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
  return value;
}

export function createTransform({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1 } = {}) {
  return Object.freeze({
    x: finiteNumber(x, 'x'),
    y: finiteNumber(y, 'y'),
    z: finiteNumber(z, 'z'),
    rx: finiteNumber(rx, 'rx'),
    ry: finiteNumber(ry, 'ry'),
    rz: finiteNumber(rz, 'rz'),
    scale: finiteNumber(scale, 'scale'),
  });
}

export function createScene({ id, version = 1, nodes = [], metadata = {} } = {}) {
  if (typeof id !== 'string' || !id.trim()) throw new TypeError('Scene id is required.');
  if (!Number.isInteger(version) || version < 1) throw new TypeError('Scene version must be a positive integer.');
  if (!Array.isArray(nodes)) throw new TypeError('Scene nodes must be an array.');

  return Object.freeze({
    id,
    version,
    nodes: Object.freeze(nodes.map((node) => Object.freeze({
      id: node.id,
      type: node.type ?? 'content',
      transform: createTransform(node.transform),
      visible: node.visible !== false,
      data: Object.freeze({ ...(node.data ?? {}) }),
    }))),
    metadata: Object.freeze({ ...metadata }),
  });
}

export function createDeviceDescriptor({ id, type, capabilities = [], simulated = true } = {}) {
  if (typeof id !== 'string' || !id.trim()) throw new TypeError('Device id is required.');
  if (!DEVICE_TYPES.includes(type)) throw new TypeError(`Unsupported holographic device type: ${type}`);

  return Object.freeze({
    id,
    type,
    capabilities: Object.freeze([...new Set(capabilities)]),
    simulated: Boolean(simulated),
  });
}

export function validateSceneForDevice(scene, device) {
  const descriptor = createDeviceDescriptor(device);
  if (!scene || typeof scene !== 'object' || !Array.isArray(scene.nodes)) {
    throw new TypeError('A valid holographic scene is required.');
  }

  const requires = scene.nodes.flatMap((node) => node.data?.requires ?? []);
  const missing = [...new Set(requires)].filter((capability) => !descriptor.capabilities.includes(capability));
  return Object.freeze({ compatible: missing.length === 0, missing });
}

export { DEVICE_TYPES };
