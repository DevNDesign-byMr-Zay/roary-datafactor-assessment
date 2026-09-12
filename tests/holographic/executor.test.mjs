/* global describe, expect, test */

import {
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
  createCalibrationProfile,
  createScene,
  executeHolographicScene,
} from '../../src/holographic/index.mjs';

describe('holographic scene executor', () => {
  test('routes projector scenes and returns an execution receipt', async () => {
    const adapter = new SimulatedProjectorAdapter({ id: 'projector-1', capabilities: ['depth'] });
    const receipt = await executeHolographicScene({ scene: createScene({ id: 'demo', nodes: [{ id: 'hero', data: { requires: ['depth'] } }] }), adapter, executionId: 'exec-1' });
    expect(receipt).toMatchObject({ executionId: 'exec-1', sceneId: 'demo', deviceId: 'projector-1', deviceType: 'projector', status: 'rendered', simulated: true });
    expect(receipt.compatibility).toEqual({ compatible: true, missing: [] });
  });

  test('uses the adapter operation for HoloMat and 3D platform targets', async () => {
    const scene = createScene({ id: 'stage', nodes: [{ id: 'hero' }] });
    const holomatReceipt = await executeHolographicScene({ scene, adapter: new SimulatedHoloMatAdapter({ id: 'mat-1' }) });
    const platformReceipt = await executeHolographicScene({ scene, adapter: new SimulatedThreeDPlatformAdapter({ id: 'platform-1' }) });
    expect(holomatReceipt.status).toBe('mapped');
    expect(platformReceipt.status).toBe('staged');
  });

  test('fails before adapter execution when capabilities are missing', async () => {
    const adapter = new SimulatedProjectorAdapter({ id: 'basic', capabilities: [] });
    await expect(executeHolographicScene({ scene: createScene({ id: 'depth-demo', nodes: [{ id: 'hero', data: { requires: ['depth'] } }] }), adapter })).rejects.toMatchObject({ phase: 'validation', deviceId: 'basic' });
  });

  test('calibrates before execution and records the calibration contract', async () => {
    const adapter = new SimulatedProjectorAdapter({ id: 'projector-cal', capabilities: [] });
    const receipt = await executeHolographicScene({ scene: createScene({ id: 'calibrated', nodes: [{ id: 'hero', transform: { x: 1, y: 2, z: 3 } }] }), adapter, calibration: createCalibrationProfile({ type: 'projector', origin: { x: 10 }, scale: 2 }) });
    expect(receipt.calibration).toEqual({ schema: 'holo.calibration.v1', type: 'projector', nodeCount: 1 });
  });

  test('rejects calibration for a different device type with a calibration phase', async () => {
    const adapter = new SimulatedProjectorAdapter({ id: 'projector-cal', capabilities: [] });
    await expect(executeHolographicScene({ scene: createScene({ id: 'calibrated', nodes: [{ id: 'hero' }] }), adapter, calibration: createCalibrationProfile({ type: 'holomat' }) })).rejects.toMatchObject({ phase: 'calibration', deviceId: 'projector-cal' });
  });

  test('classifies adapter failures as execution-phase failures without hiding the cause', async () => {
    const adapter = { device: { id: 'projector-fault', type: 'projector', capabilities: [], simulated: true }, render: async () => { throw new Error('simulated transport fault'); } };
    await expect(executeHolographicScene({ scene: createScene({ id: 'fault-demo' }), adapter, executionId: 'fault-1' })).rejects.toMatchObject({ phase: 'execution', executionId: 'fault-1', sceneId: 'fault-demo', deviceId: 'projector-fault', cause: expect.any(Error) });
  });
});
