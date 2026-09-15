import { describe, expect, test } from '@jest/globals';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createCalibrationProfile, mapLogicalTransform, mapSceneToDisplay } from '../../src/holographic/calibration.mjs';
import { SimulatedProjectorAdapter } from '../../src/holographic/adapters.mjs';

describe('holographic display calibration', () => {
  const profile = { width: 1920, height: 1080, originX: 100, originY: 50, scaleX: 2, scaleY: 3, depthScale: 4 };

  test('maps logical coordinates into calibrated display space', () => {
    expect(mapLogicalTransform({ x: 10, y: 5, z: 2, scale: 1 }, profile)).toEqual({
      x: 120, y: 65, z: 8, rx: 0, ry: 0, rz: 0, scale: 1,
    });
  });

  test('projects a complete scene without changing its logical source', () => {
    const scene = createScene({ id: 'grid-demo', version: 2, metadata: { purpose: 'test' }, nodes: [{ id: 'solar', type: 'mesh', data: { requires: ['depth'] }, transform: { x: 2, y: 3, z: 1 } }] });
    const display = mapSceneToDisplay(scene, profile);
    expect(display.id).toBe('grid-demo');
    expect(display.version).toBe(2);
    expect(display.metadata).toEqual({ purpose: 'test' });
    expect(display.nodes[0].type).toBe('mesh');
    expect(display.nodes[0].data).toEqual({ requires: ['depth'] });
    expect(display.nodes[0].transform.x).toBe(104);
    expect(display.nodes[0].transform.y).toBe(59);
    expect(scene.nodes[0].transform.x).toBe(2);
  });

  test('preserves capability requirements for downstream device validation', () => {
    const scene = createScene({ id: 'capability-demo', nodes: [{ id: 'depth-node', data: { requires: ['depth'] }, transform: { x: 1 } }] });
    const display = mapSceneToDisplay(scene, profile);
    const adapter = new SimulatedProjectorAdapter({ id: 'projector-no-depth' });
    expect(adapter.device.capabilities).not.toContain('depth');
    expect(() => adapter.render(display)).rejects.toThrow('Scene requires unsupported capabilities: depth');
  });

  test('rejects unsafe calibration dimensions', () => {
    expect(() => createCalibrationProfile({ width: 0, height: 1080 })).toThrow('width must be greater than zero');
  });
});
