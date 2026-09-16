/* global describe, expect, jest, test */

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

  test('rejects an invalid device descriptor before adapter execution', async () => {
    const render = jest.fn(async () => ({ status: 'rendered' }));

    await expect(executeHolographicScene({
      scene: createScene({ id: 'invalid-device' }),
      adapter: {
        device: { id: 'device-1', type: 'projector', capabilities: 'depth', simulated: true },
        render,
      },
    })).rejects.toThrow('Device capabilities must be an array');
    expect(render).not.toHaveBeenCalled();
  });

  test('rejects an adapter result with the wrong operation status', async () => {
    const render = jest.fn(async () => ({ status: 'staged' }));

    await expect(executeHolographicScene({
      scene: createScene({ id: 'status-contract' }),
      adapter: {
        device: { id: 'device-1', type: 'projector', capabilities: [], simulated: true },
        render,
      },
    })).rejects.toThrow('status rendered');
    expect(render).toHaveBeenCalledTimes(1);
  });
});
