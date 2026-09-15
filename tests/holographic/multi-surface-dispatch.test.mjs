import { expect, it } from 'vitest';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createCalibrationProfile } from '../../src/holographic/calibration.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchHolographicDisplaySession } from '../../src/holographic/display-dispatch.mjs';
import { SimulatedHoloMatAdapter, SimulatedProjectorAdapter, SimulatedThreeDPlatformAdapter } from '../../src/holographic/adapters.mjs';
const scene = createScene({ id: 'surface-fixture', nodes: [{ id: 'asset-a', label: 'Asset A', position: { x: 1, y: 2, z: 3 }, capabilities: ['topology'] }] });
const calibration = createCalibrationProfile({ width: 1920, height: 1080, scaleX: 1, scaleY: 1, depthScale: 1 });
it('dispatches one validated renderer-neutral session across simulated surfaces', async () => {
  const surfaces = [[new SimulatedHoloMatAdapter({ id: 'mat-test', capabilities: ['topology'] }), 'mapScene'], [new SimulatedProjectorAdapter({ id: 'projector-test', capabilities: ['topology'] }), 'render'], [new SimulatedThreeDPlatformAdapter({ id: 'three-d-test', capabilities: ['topology'] }), 'stage']];
  const session = createDisplaySession({ scene, calibrationProfile: calibration, sessionId: 'surface-session' });
  const results = [];
  for (const [adapter, operation] of surfaces) {
    const dispatched = await dispatchHolographicDisplaySession({ session, adapter, operation });
    results.push(dispatched);
    expect(dispatched.safety.authoritative).toBe(false);
    expect(dispatched.safety.physicalActuation).toBe(false);
  }
  expect(results.map((item) => item.result.status)).toEqual(['mapped', 'rendered', 'staged']);
  expect(results.map((item) => item.result.sceneId)).toEqual(['surface-fixture', 'surface-fixture', 'surface-fixture']);
});
