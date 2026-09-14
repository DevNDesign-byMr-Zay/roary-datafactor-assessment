import { expect, test } from '@jest/globals';
import {
  createScene,
  createCalibrationProfile,
  createHolographicSurfaceSession,
  dispatchHolographicSurfaceSession,
  SimulatedHoloMatAdapter,
  verifyHolographicDispatchFingerprint,
} from '../../src/holographic/index.mjs';

test('surface dispatch returns a deterministic integrity fingerprint', async () => {
  const scene = createScene({ id: 'dispatch-fingerprint-scene', nodes: [] });
  const calibration = createCalibrationProfile({ width: 1920, height: 1080, scaleX: 2, scaleY: 2 });
  const session = createHolographicSurfaceSession({ scene, calibrationProfile: calibration, sessionId: 'dispatch-fingerprint-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  expect(dispatch.dispatchFingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(verifyHolographicDispatchFingerprint(dispatch)).toBe(true);
  expect(dispatch.safety.physicalActuation).toBe(false);
});

test('tampering a dispatch result invalidates its fingerprint', async () => {
  const scene = createScene({ id: 'dispatch-tamper-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-tamper-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  expect(verifyHolographicDispatchFingerprint({ ...dispatch, operation: 'render' })).toBe(false);
});
