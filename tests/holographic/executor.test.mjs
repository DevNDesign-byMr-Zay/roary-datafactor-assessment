/* global describe, expect, test */

import {
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
  createScene,
  executeHolographicScene,
} from '../../src/holographic/index.mjs';

describe('holographic scene executor', () => {
  test('routes projector scenes and returns an execution receipt', async () => {
    const adapter = new SimulatedProjectorAdapter({ id: 'projector-1', capabilities: ['depth'] });
    const receipt = await executeHolographicScene({
      scene: createScene({ id: 'demo', nodes: [{ id: 'hero', data: { requires: ['depth'] } }] }),
      adapter,
      executionId: 'exec-1',
    });

    expect(receipt).toMatchObject({
      executionId: 'exec-1',
      sceneId: 'demo',
      deviceId: 'projector-1',
      deviceType: 'projector',
      status: 'rendered',
      simulated: true,
    });
    expect(receipt.compatibility).toEqual({ compatible: true, missing: [] });
  });

  test('uses the adapter operation for HoloMat and 3D platform targets', async () => {
    const scene = createScene({ id: 'stage', nodes: [{ id: 'hero' }] });
    const holomatReceipt = await executeHolographicScene({
      scene,
      adapter: new SimulatedHoloMatAdapter({ id: 'mat-1' }),
    });
    const platformReceipt = await executeHolographicScene({
      scene,
      adapter: new SimulatedThreeDPlatformAdapter({ id: 'platform-1' }),
    });

    expect(holomatReceipt.status).toBe('mapped');
    expect(platformReceipt.status).toBe('staged');
  });

  test('fails before adapter execution when capabilities are missing', async () => {
    const adapter = new SimulatedProjectorAdapter({ id: 'basic', capabilities: [] });

    await expect(executeHolographicScene({
      scene: createScene({ id: 'depth-demo', nodes: [{ id: 'hero', data: { requires: ['depth'] } }] }),
      adapter,
    })).rejects.toThrow('depth');
  });
});
