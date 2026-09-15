import assert from 'node:assert/strict';
import {
  createScene,
  createCalibrationProfile,
  createHolographicSurfaceSession,
  dispatchHolographicSurfaceSession,
  SimulatedHoloMatAdapter,
  verifyHolographicDispatchFingerprint,
} from '../../src/holographic/index.mjs';

test('surface dispatch returns a deterministic integrity fingerprint bound to the session', async () => {
  const scene = createScene({ id: 'dispatch-fingerprint-scene', nodes: [] });
  const calibration = createCalibrationProfile({ width: 1920, height: 1080, scaleX: 2, scaleY: 2 });
  const session = createHolographicSurfaceSession({ scene, calibrationProfile: calibration, sessionId: 'dispatch-fingerprint-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  assert.match(dispatch.dispatchFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(dispatch.sessionFingerprint, session.displaySession.sessionFingerprint);
  assert.equal(verifyHolographicDispatchFingerprint(dispatch), true);
  assert.equal(dispatch.safety.physicalActuation, false);
});

test('tampering a dispatch result invalidates its fingerprint', async () => {
  const scene = createScene({ id: 'dispatch-tamper-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-tamper-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  assert.equal(verifyHolographicDispatchFingerprint({ ...dispatch, operation: 'render' }), false);
});

test('tampering the dispatch safety policy invalidates its fingerprint', async () => {
  const scene = createScene({ id: 'dispatch-safety-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-safety-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  assert.equal(verifyHolographicDispatchFingerprint({
    ...dispatch,
    safety: { ...dispatch.safety, physicalActuation: true },
  }), false);
});

test('tampering the bound session fingerprint invalidates the dispatch', async () => {
  const scene = createScene({ id: 'dispatch-session-tamper-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-session-tamper' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  assert.equal(verifyHolographicDispatchFingerprint({ ...dispatch, sessionFingerprint: '0'.repeat(64) }), false);
});

test('surface dispatch refuses inherited adapter operations', async () => {
  const scene = createScene({ id: 'dispatch-inherited-operation-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-inherited-operation-session' });
  const adapter = Object.create({ mapScene: () => ({ forged: true }) });
  adapter.device = { type: 'holomat' };
  await assert.rejects(
    () => dispatchHolographicSurfaceSession({ session, adapter }),
    /adapter operation not supported: mapScene/,
  );
});
