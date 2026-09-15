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

test('rejects a dispatch whose safety policy is inherited from a prototype', async () => {
  const scene = createScene({ id: 'dispatch-prototype-safety-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-prototype-safety-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  const forgedSafety = Object.create({ authoritative: false, physicalActuation: false, advisoryOnly: true });
  assert.equal(verifyHolographicDispatchFingerprint({ ...dispatch, safety: forgedSafety }), false);
});

test('rejects a dispatch whose safety object is missing an own invariant flag', async () => {
  const scene = createScene({ id: 'dispatch-missing-safety-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-missing-safety-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  const partialSafety = { authoritative: false, physicalActuation: false };
  assert.equal(verifyHolographicDispatchFingerprint({ ...dispatch, safety: partialSafety }), false);
});

test('rejects a prototype-backed dispatch envelope', async () => {
  const scene = createScene({ id: 'dispatch-prototype-envelope-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-prototype-envelope-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  const forgedDispatch = Object.create(dispatch);
  assert.equal(verifyHolographicDispatchFingerprint(forgedDispatch), false);
});
