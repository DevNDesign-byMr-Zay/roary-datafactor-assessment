import { createScene, validateSceneForDevice } from './contracts.mjs';
import { calibrateScene, createCalibrationProfile, CALIBRATION_SCHEMA } from './calibration.mjs';

const METHODS = Object.freeze({ projector: 'render', holomat: 'mapScene', 'three-d-platform': 'stage' });

function executionError(error, phase, context) {
  const wrapped = new Error(`Holographic execution failed during ${phase}: ${error?.message ?? String(error)}`, { cause: error });
  Object.assign(wrapped, { phase, ...context });
  return wrapped;
}

export async function executeHolographicScene({ scene, adapter, executionId, calibration } = {}) {
  if (!scene || typeof scene !== 'object') throw new TypeError('A holographic scene is required.');
  if (!adapter || typeof adapter !== 'object' || !adapter.device) throw new TypeError('A holographic adapter is required.');

  let normalizedScene;
  try { normalizedScene = createScene(scene); }
  catch (error) { throw executionError(error, 'validation', { executionId }); }

  const compatibility = validateSceneForDevice(normalizedScene, adapter.device);
  if (!compatibility.compatible) {
    throw executionError(new Error(`Scene requires unsupported capabilities: ${compatibility.missing.join(', ')}`), 'validation', {
      executionId: executionId ?? `${normalizedScene.id}:${adapter.device.id}`,
      sceneId: normalizedScene.id,
      deviceId: adapter.device.id,
    });
  }

  const method = METHODS[adapter.device.type];
  if (!method || typeof adapter[method] !== 'function') {
    throw executionError(new TypeError(`Adapter does not support ${adapter.device.type} execution.`), 'validation', {
      executionId: executionId ?? `${normalizedScene.id}:${adapter.device.id}`,
      sceneId: normalizedScene.id,
      deviceId: adapter.device.id,
    });
  }

  let executionScene = normalizedScene;
  let calibrationReceipt = null;
  if (calibration) {
    try {
      const profile = calibration.schema === CALIBRATION_SCHEMA
        ? calibration
        : createCalibrationProfile({ ...calibration, type: calibration.type ?? adapter.device.type });
      if (profile.type !== adapter.device.type) throw new Error(`Calibration type ${profile.type} does not match ${adapter.device.type}.`);
      executionScene = calibrateScene(normalizedScene, profile);
      calibrationReceipt = Object.freeze({ schema: profile.schema, type: profile.type, nodeCount: executionScene.nodes.length });
    } catch (error) {
      throw executionError(error, 'calibration', { executionId: executionId ?? `${normalizedScene.id}:${adapter.device.id}`, sceneId: normalizedScene.id, deviceId: adapter.device.id });
    }
  }

  const startedAt = new Date().toISOString();
  try {
    const result = await adapter[method](executionScene);
    return Object.freeze({ executionId: executionId ?? `${normalizedScene.id}:${adapter.device.id}`, sceneId: normalizedScene.id, deviceId: adapter.device.id, deviceType: adapter.device.type, status: result.status, simulated: adapter.device.simulated, startedAt, compatibility, calibration: calibrationReceipt });
  } catch (error) {
    throw executionError(error, 'execution', { executionId: executionId ?? `${normalizedScene.id}:${adapter.device.id}`, sceneId: normalizedScene.id, deviceId: adapter.device.id });
  }
}
