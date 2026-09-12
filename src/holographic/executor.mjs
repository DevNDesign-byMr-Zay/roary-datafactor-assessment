import { createScene, validateSceneForDevice } from './contracts.mjs';
import { calibrateScene, createCalibrationProfile, CALIBRATION_SCHEMA } from './calibration.mjs';

const METHODS = Object.freeze({
  projector: 'render',
  holomat: 'mapScene',
  'three-d-platform': 'stage',
});

export async function executeHolographicScene({ scene, adapter, executionId, calibration } = {}) {
  if (!scene || typeof scene !== 'object') throw new TypeError('A holographic scene is required.');
  if (!adapter || typeof adapter !== 'object' || !adapter.device) throw new TypeError('A holographic adapter is required.');

  const normalizedScene = createScene(scene);
  const compatibility = validateSceneForDevice(normalizedScene, adapter.device);
  if (!compatibility.compatible) {
    throw new Error(`Scene requires unsupported capabilities: ${compatibility.missing.join(', ')}`);
  }

  const method = METHODS[adapter.device.type];
  if (!method || typeof adapter[method] !== 'function') {
    throw new TypeError(`Adapter does not support ${adapter.device.type} execution.`);
  }

  let executionScene = normalizedScene;
  let calibrationReceipt = null;
  if (calibration) {
    const profile = calibration.schema === CALIBRATION_SCHEMA
      ? calibration
      : createCalibrationProfile({ ...calibration, type: calibration.type ?? adapter.device.type });
    if (profile.type !== adapter.device.type) {
      throw new Error(`Calibration type ${profile.type} does not match ${adapter.device.type}.`);
    }
    executionScene = calibrateScene(normalizedScene, profile);
    calibrationReceipt = Object.freeze({ schema: profile.schema, type: profile.type });
  }

  const startedAt = new Date().toISOString();
  const result = await adapter[method](executionScene);
  return Object.freeze({
    executionId: executionId ?? `${normalizedScene.id}:${adapter.device.id}`,
    sceneId: normalizedScene.id,
    deviceId: adapter.device.id,
    deviceType: adapter.device.type,
    status: result.status,
    simulated: adapter.device.simulated,
    startedAt,
    compatibility,
    calibration: calibrationReceipt,
  });
}
