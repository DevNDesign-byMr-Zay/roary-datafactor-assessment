import { describe, expect, test } from '@jest/globals';
import { createCalibrationProfile, mapPoint, calibrateScene } from '../../src/holographic/calibration.mjs';
import { createScene } from '../../src/holographic/contracts.mjs';

describe('holographic calibration', () => {
  test('maps a point deterministically using origin and scale', () => {
    const profile = createCalibrationProfile({ type: 'projector', origin: { x: 10, y: -2, z: 4 }, scale: 2 });
    expect(mapPoint({ x: 1, y: 3, z: -2 }, profile)).toEqual({ x: 12, y: 4, z: 0 });
  });

  test('rejects unsupported profiles', () => {
    expect(() => createCalibrationProfile({ type: 'camera' })).toThrow(/Unsupported/);
  });

  test('calibrates scene nodes without mutating the source scene', () => {
    const scene = createScene({ id: 'demo', nodes: [{ id: 'hero', transform: { x: 1, y: 2, z: 3 } }] });
    const profile = createCalibrationProfile({ type: 'holomat', origin: { x: 5 } });
    const calibrated = calibrateScene(scene, profile);
    expect(calibrated.nodes[0].transform).toMatchObject({ x: 6, y: 2, z: 3 });
    expect(scene.nodes[0].transform.x).toBe(1);
    expect(calibrated.metadata.calibrationType).toBe('holomat');
  });
});
