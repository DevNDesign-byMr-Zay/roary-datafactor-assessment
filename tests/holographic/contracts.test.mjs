/* global describe, expect, test */

import { createDeviceDescriptor, createScene, createTransform, validateSceneForDevice } from '../../src/holographic/index.mjs';

describe('holographic contracts', () => {
  test('creates deterministic transforms', () => {
    expect(createTransform({ x: 1, z: 2 })).toEqual({
      x: 1,
      y: 0,
      z: 2,
      rx: 0,
      ry: 0,
      rz: 0,
      scale: 1,
    });
  });

  test('creates immutable scene nodes', () => {
    const scene = createScene({
      id: 'demo',
      nodes: [{ id: 'hero', data: { requires: ['depth'] } }],
    });
    expect(scene.id).toBe('demo');
    expect(scene.nodes[0].transform.scale).toBe(1);
    expect(Object.isFrozen(scene)).toBe(true);
  });

  test('negotiates device capabilities', () => {
    const scene = createScene({
      id: 'demo',
      nodes: [{
        id: 'hero',
        data: { requires: ['depth', 'calibrated-projection'] },
      }],
    });
    const device = createDeviceDescriptor({
      id: 'sim-projector',
      type: 'projector',
      capabilities: ['depth'],
    });
    expect(validateSceneForDevice(scene, device)).toEqual({
      compatible: false,
      missing: ['calibrated-projection'],
    });
  });
});
