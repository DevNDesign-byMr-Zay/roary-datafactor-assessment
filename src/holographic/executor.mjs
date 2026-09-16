import { createDeviceDescriptor, createScene, validateSceneForDevice } from './contracts.mjs';

const METHODS = Object.freeze({
  projector: 'render',
  holomat: 'mapScene',
  'three-d-platform': 'stage',
});

export async function executeHolographicScene({ scene, adapter, executionId } = {}) {
  if (!scene || typeof scene !== 'object') throw new TypeError('A holographic scene is required.');
  if (!adapter || typeof adapter !== 'object' || !adapter.device) throw new TypeError('A holographic adapter is required.');

  const normalizedScene = createScene(scene);
  const device = createDeviceDescriptor(adapter.device);
  const compatibility = validateSceneForDevice(normalizedScene, device);
  if (!compatibility.compatible) {
    throw new Error(`Scene requires unsupported capabilities: ${compatibility.missing.join(', ')}`);
  }

  const method = METHODS[device.type];
  if (!method || typeof adapter[method] !== 'function') {
    throw new TypeError(`Adapter does not support ${device.type} execution.`);
  }

  const startedAt = new Date().toISOString();
  const result = await adapter[method](normalizedScene);
  return Object.freeze({
    executionId: executionId ?? `${normalizedScene.id}:${device.id}`,
    sceneId: normalizedScene.id,
    deviceId: device.id,
    deviceType: device.type,
    status: result.status,
    simulated: device.simulated,
    startedAt,
    compatibility,
  });
}
