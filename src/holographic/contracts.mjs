const DEVICE_TYPES = Object.freeze(['projector', 'holomat', 'three-d-platform']);

function finiteNumber(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
  return value;
}

export function createTransform({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1 } = {}) {
  const normalizedScale = finiteNumber(scale, 'scale');
  if (normalizedScale <= 0) throw new RangeError('scale must be greater than zero.');
  return Object.freeze({
    x: finiteNumber(x, 'x'), y: finiteNumber(y, 'y'), z: finiteNumber(z, 'z'),
    rx: finiteNumber(rx, 'rx'), ry: finiteNumber(ry, 'ry'), rz: finiteNumber(rz, 'rz'),
    scale: normalizedScale,
  });
}

export function createScene({ id, version = 1, nodes = [], metadata = {} } = {}) {
  if (typeof id !== 'string' || !id.trim()) throw new TypeError('Scene id is required.');
  if (!Number.isInteger(version) || version < 1) throw new TypeError('Scene version must be a positive integer.');
  if (!Array.isArray(nodes)) throw new TypeError('Scene nodes must be an array.');
  const normalizedNodes = nodes.map((node, index) => {
    if (!node || typeof node !== 'object') throw new TypeError(`Scene node ${index} must be an object.`);
    const nodeId = String(node.id ?? `node-${index + 1}`).trim();
    if (!nodeId) throw new TypeError(`Scene node ${index} id is required.`);
    return Object.freeze({
      id: nodeId,
      type: node.type ?? 'content',
      transform: createTransform(node.transform),
      visible: node.visible !== false,
      data: Object.freeze({ ...(node.data ?? {}) }),
    });
  });
  return Object.freeze({ id: id.trim(), version, nodes: Object.freeze(normalizedNodes), metadata: Object.freeze({ ...metadata }) });
}

export function createDeviceDescriptor({ id, type, capabilities = [], simulated = true } = {}) {
  if (typeof id !== 'string' || !id.trim()) throw new TypeError('Device id is required.');
  if (!DEVICE_TYPES.includes(type)) throw new TypeError(`Unsupported holographic device type: ${type}`);
  if (!Array.isArray(capabilities)) throw new TypeError('Device capabilities must be an array.');
  return Object.freeze({ id: id.trim(), type, capabilities: Object.freeze([...new Set(capabilities.map(String))]), simulated: Boolean(simulated) });
}

export function validateSceneForDevice(scene, device) {
  const descriptor = createDeviceDescriptor(device);
  if (!scene || typeof scene !== 'object' || !Array.isArray(scene.nodes)) throw new TypeError('A valid holographic scene is required.');
  const requires = scene.nodes.flatMap((node) => node.data?.requires ?? []).map(String);
  const missing = [...new Set(requires)].filter((capability) => !descriptor.capabilities.includes(capability));
  return Object.freeze({ compatible: missing.length === 0, missing });
}

export { DEVICE_TYPES };
