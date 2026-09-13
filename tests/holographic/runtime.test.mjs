import { describe, expect, test } from '@jest/globals';

import { SimulatedProjectorAdapter } from '../../src/holographic/adapters.mjs';
import { createScene } from '../../src/holographic/contracts.mjs';
import { executeHolographicScene } from '../../src/holographic/runtime.mjs';

describe('holographic runtime', () => {
  test('executes a compatible scene through an adapter', async () => {
    const scene = createScene({ id: 'demo', nodes: [{ id: 'hero' }] });
    const adapter = new SimulatedProjectorAdapter({ id: 'projector-1', capabilities: ['depth'] });

    const receipt = await executeHolographicScene({ scene, adapter });

    expect(receipt).toMatchObject({ status: 'executed', sceneId: 'demo', deviceId: 'projector-1', simulated: true });
    expect(receipt.execution.status).toBe('rendered');
  });

  test('rejects a scene before device execution when capabilities are missing', async () => {
    const scene = createScene({ id: 'depth-demo', nodes: [{ id: 'hero', data: { requires: ['depth'] } }] });
    const adapter = new SimulatedProjectorAdapter({ id: 'basic', capabilities: [] });

    await expect(executeHolographicScene({ scene, adapter })).resolves.toEqual({
      status: 'rejected',
      sceneId: 'depth-demo',
      deviceId: 'basic',
      missing: ['depth'],
    });
  });
});
