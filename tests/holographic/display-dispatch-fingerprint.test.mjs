import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createScene,
  createCalibrationProfile,
  createHolographicSurfaceSession,
  dispatchHolographicSurfaceSession,
  SimulatedHoloMatAdapter,
  verifyHolographicDispatchFingerprint,
} from '../../src/holographic/index.mjs';

test('surface dispatch returns a deterministic integrity fingerprint', async () => {
  const scene = createScene({ sceneId: 'dispatch-fingerprint-scene', nodes: [] });
  const calibration = createCalibrationProfile({ width: 1920, height: 1080, scaleX: 2, scaleY: 2 });
  const session = createHolographicSurfaceSession({ scene, calibrationProfile: calibration, sessionId: 'dispatch-fingerprint-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  assert.match(dispatch.dispatchFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(verifyHolographicDispatchFingerprint(dispatch), true);
  assert.equal(dispatch.safety.physicalActuation, false);
});

test('tampering a dispatch result invalidates its fingerprint', async () => {
  const scene = createScene({ sceneId: 'dispatch-tamper-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-tamper-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  assert.equal(verifyHolographicDispatchFingerprint({ ...dispatch, operation: 'render' }), false);
});
