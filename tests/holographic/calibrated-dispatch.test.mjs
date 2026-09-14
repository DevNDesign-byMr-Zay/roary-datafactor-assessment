import { expect, test } from '@jest/globals';
import { createScene, createCalibrationProfile, createDisplaySession, dispatchHolographicDisplaySession } from '../../src/holographic/index.mjs';

const scene = createScene({ id: 'calibrated-dispatch', nodes: [{ id: 'node-1', type: 'content', transform: { x: 2, y: 3, z: 4 } }] });
const profile = createCalibrationProfile({ width: 100, height: 80, originX: 10, originY: 20, scaleX: 5, scaleY: 4, depthScale: 2 });

test('display dispatch maps logical coordinates through calibration before adapter execution', async () => {
  let received;
  const adapter = { async render(value) { received = value; return { status: 'rendered', sceneId: value.sceneId }; } };
  const session = createDisplaySession({ scene, calibrationProfile: profile, sessionId: 'session-calibrated' });
  const result = await dispatchHolographicDisplaySession({ session, adapter });
  expect(result.calibrated).toBe(true);
  expect(received.nodes[0].transform).toEqual({
    x: 20,
    y: 32,
    z: 8,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1,
  });
  expect(result.safety.physicalActuation).toBe(false);
});
