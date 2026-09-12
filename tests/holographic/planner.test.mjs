import { createDeviceDescriptor } from '../../src/holographic/contracts.mjs';
import { planHolographicScene } from '../../src/holographic/planner.mjs';

describe('holographic scene planner', () => {
  test('creates a deterministic scene from intent and assets', () => {
    const device = createDeviceDescriptor({
      id: 'sim-projector',
      type: 'projector',
      capabilities: ['alpha', 'depth'],
    });

    const result = planHolographicScene({
      intent: 'Product Showcase',
      assets: [{ id: 'product', source: 'canva', requires: ['depth'] }],
      device,
    });

    expect(result.scene.id).toBe('scene-product-showcase');
    expect(result.scene.nodes[0].data.source).toBe('canva');
    expect(result.compatibility).toEqual({ compatible: true, missing: [] });
  });

  test('rejects plans that exceed device capabilities', () => {
    const device = createDeviceDescriptor({ id: 'basic', type: 'projector', capabilities: [] });

    expect(() => planHolographicScene({
      intent: 'Depth Demo',
      assets: [{ id: 'demo', requires: ['depth'] }],
      device,
    })).toThrow('depth');
  });
});
