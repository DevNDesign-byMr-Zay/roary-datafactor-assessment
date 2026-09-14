function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
  return value;
}

function positive(value, name) {
  const number = finite(value, name);
  if (number <= 0) throw new RangeError(`${name} must be greater than zero.`);
  return number;
}

export function createCalibrationProfile({ width, height, originX = 0, originY = 0, scaleX = 1, scaleY = 1, depthScale = 1 } = {}) {
  return Object.freeze({
    width: positive(width, 'width'),
    height: positive(height, 'height'),
    originX: finite(originX, 'originX'),
    originY: finite(originY, 'originY'),
    scaleX: positive(scaleX, 'scaleX'),
    scaleY: positive(scaleY, 'scaleY'),
    depthScale: positive(depthScale, 'depthScale'),
  });
}

export function mapLogicalTransform(transform, profile) {
  const source = transform ?? {};
  const calibration = createCalibrationProfile(profile);
  return Object.freeze({
    x: calibration.originX + finite(source.x ?? 0, 'transform.x') * calibration.scaleX,
    y: calibration.originY + finite(source.y ?? 0, 'transform.y') * calibration.scaleY,
    z: finite(source.z ?? 0, 'transform.z') * calibration.depthScale,
    rx: finite(source.rx ?? 0, 'transform.rx'),
    ry: finite(source.ry ?? 0, 'transform.ry'),
    rz: finite(source.rz ?? 0, 'transform.rz'),
    scale: positive(source.scale ?? 1, 'transform.scale'),
  });
}

export function mapSceneToDisplay(scene, profile) {
  if (!scene || typeof scene !== 'object' || !Array.isArray(scene.nodes)) {
    throw new TypeError('A valid holographic scene is required.');
  }
  const calibration = createCalibrationProfile(profile);
  return Object.freeze({
    id: scene.id,
    sceneId: scene.id,
    calibration,
    nodes: Object.freeze(scene.nodes.map((node) => Object.freeze({
      id: node.id,
      transform: mapLogicalTransform(node.transform, calibration),
      visible: node.visible !== false,
      data: Object.freeze({ ...(node.data ?? {}) }),
    }))),
  });
}
