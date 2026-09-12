import { validateSceneForDevice } from './contracts.mjs';

export async function executeHolographicScene({ scene, adapter }) {
  if (!scene || typeof scene.id !== 'string') throw new TypeError('A valid holographic scene is required.');
  if (!adapter || typeof adapter.connect !== 'function') throw new TypeError('A holographic adapter is required.');
  if (typeof adapter.render !== 'function' && typeof adapter.mapScene !== 'function' && typeof adapter.stage !== 'function') {
    throw new TypeError('Adapter does not expose a scene execution method.');
  }

  const device = await adapter.connect();
  const compatibility = validateSceneForDevice(scene, device);
  if (!compatibility.compatible) {
    return Object.freeze({ status: 'rejected', sceneId: scene.id, deviceId: device.id, missing: compatibility.missing });
  }

  const execute = adapter.render ?? adapter.mapScene ?? adapter.stage;
  const execution = await execute.call(adapter, scene);
  return Object.freeze({
    status: 'executed',
    sceneId: scene.id,
    deviceId: device.id,
    simulated: device.simulated,
    execution,
  });
}
