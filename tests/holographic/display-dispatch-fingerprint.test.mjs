import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import {
  createScene,
  createCalibrationProfile,
  createDisplaySession,
  createHolographicSurfaceSession,
  dispatchHolographicDisplaySession,
  dispatchHolographicSurfaceSession,
  SimulatedHoloMatAdapter,
  verifyHolographicDispatchAgainstAdapter,
  verifyHolographicDispatchAgainstSession,
  verifyHolographicDispatchFingerprint,
} from '../../src/holographic/index.mjs';

test('surface dispatch returns deterministic integrity and session-lineage fingerprints', async () => {
  const scene = createScene({ sceneId: 'dispatch-fingerprint-scene', nodes: [] });
  const calibration = createCalibrationProfile({ width: 1920, height: 1080, scaleX: 2, scaleY: 2 });
  const adapter = new SimulatedHoloMatAdapter({ id: 'holo-mat-test' });
  const session = createHolographicSurfaceSession({ scene, calibrationProfile: calibration, sessionId: 'dispatch-fingerprint-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter });
  assert.match(dispatch.dispatchFingerprint, /^[a-f0-9]{64}$/);
  assert.match(dispatch.sessionFingerprint, /^[a-f0-9]{64}$/);
  assert.match(dispatch.sourcePacketFingerprint, /^[a-f0-9]{64}$/);
  assert.deepEqual(dispatch.adapterDevice, adapter.device);
  assert.equal(verifyHolographicDispatchFingerprint(dispatch), true);
  assert.equal(verifyHolographicDispatchAgainstSession(dispatch, session.displaySession), true);
  assert.equal(verifyHolographicDispatchAgainstAdapter(dispatch, adapter), true);
  assert.equal(dispatch.safety.physicalActuation, false);
});

test('tampering a dispatch result invalidates its fingerprint', async () => {
  const scene = createScene({ sceneId: 'dispatch-tamper-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-tamper-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });
  assert.equal(verifyHolographicDispatchFingerprint({ ...dispatch, operation: 'render' }), false);
});

test('tampering the dispatch safety policy invalidates its fingerprint', async () => {
  const scene = createScene({ sceneId: 'dispatch-safety-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-safety-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });

  assert.equal(verifyHolographicDispatchFingerprint({
    ...dispatch,
    safety: { ...dispatch.safety, physicalActuation: true },
  }), false);
  assert.equal(verifyHolographicDispatchFingerprint({
    ...dispatch,
    safety: { ...dispatch.safety, authoritative: true },
  }), false);
  assert.equal(verifyHolographicDispatchFingerprint({
    ...dispatch,
    safety: { ...dispatch.safety, extraAuthority: true },
  }), false);
});

test('dispatch snapshots adapter evidence before fingerprinting', async () => {
  const scene = createScene({ sceneId: 'dispatch-isolation-scene', nodes: [] });
  const session = createDisplaySession({ scene, sessionId: 'dispatch-isolation-session' });
  const sourceResult = {
    status: 'rendered',
    metrics: { confidence: 0.9 },
    tags: ['reviewed'],
  };
  const adapter = {
    async render() {
      return sourceResult;
    },
  };

  const dispatch = await dispatchHolographicDisplaySession({ session, adapter });
  const originalFingerprint = dispatch.dispatchFingerprint;

  sourceResult.metrics.confidence = 0.1;
  sourceResult.tags.push('mutated');

  assert.deepEqual(dispatch.result, {
    status: 'rendered',
    metrics: { confidence: 0.9 },
    tags: ['reviewed'],
  });
  assert.equal(dispatch.adapterDevice, null);
  assert.equal(Object.isFrozen(dispatch.result), true);
  assert.equal(Object.isFrozen(dispatch.result.metrics), true);
  assert.equal(Object.isFrozen(dispatch.result.tags), true);
  assert.equal(dispatch.dispatchFingerprint, originalFingerprint);
  assert.equal(verifyHolographicDispatchFingerprint(dispatch), true);
  assert.equal(verifyHolographicDispatchAgainstSession(dispatch, session), true);
  assert.equal(verifyHolographicDispatchAgainstAdapter(dispatch, adapter), false);
});

test('dispatch lineage rejects a different but otherwise valid session', async () => {
  const scene = createScene({ sceneId: 'dispatch-lineage-scene', nodes: [] });
  const session = createDisplaySession({ scene, sessionId: 'dispatch-lineage-session-a' });
  const otherSession = createDisplaySession({ scene, sessionId: 'dispatch-lineage-session-b' });
  const dispatch = await dispatchHolographicDisplaySession({
    session,
    adapter: { async render() { return { status: 'rendered' }; } },
  });

  assert.equal(verifyHolographicDispatchFingerprint(dispatch), true);
  assert.equal(verifyHolographicDispatchAgainstSession(dispatch, session), true);
  assert.equal(verifyHolographicDispatchAgainstSession(dispatch, otherSession), false);
  assert.equal(
    verifyHolographicDispatchFingerprint({
      ...dispatch,
      sessionFingerprint: otherSession.sessionFingerprint,
    }),
    false,
  );
  assert.equal(
    verifyHolographicDispatchFingerprint({
      ...dispatch,
      sourcePacketFingerprint: '0'.repeat(64),
    }),
    false,
  );
});

test('dispatch device lineage rejects a different valid adapter identity', async () => {
  const scene = createScene({ sceneId: 'dispatch-device-lineage-scene', nodes: [] });
  const session = createDisplaySession({ scene, sessionId: 'dispatch-device-lineage-session' });
  const adapter = new SimulatedHoloMatAdapter({ id: 'holo-mat-a', capabilities: ['depth'] });
  const otherAdapter = new SimulatedHoloMatAdapter({ id: 'holo-mat-b', capabilities: ['depth'] });
  const dispatch = await dispatchHolographicDisplaySession({
    session,
    adapter,
    operation: 'mapScene',
    surfaceType: 'holo-mat',
  });

  assert.equal(verifyHolographicDispatchAgainstAdapter(dispatch, adapter), true);
  assert.equal(verifyHolographicDispatchAgainstAdapter(dispatch, otherAdapter), false);
  assert.equal(
    verifyHolographicDispatchFingerprint({
      ...dispatch,
      adapterDevice: otherAdapter.device,
    }),
    false,
  );
});

test('dispatch rejects accessor-backed adapter identity without evaluating getters', async () => {
  const scene = createScene({ sceneId: 'dispatch-device-accessor-scene', nodes: [] });
  const session = createDisplaySession({ scene, sessionId: 'dispatch-device-accessor-session' });
  let getterReads = 0;
  const adapter = {
    async render() {
      return { status: 'rendered' };
    },
  };
  Object.defineProperty(adapter, 'device', {
    enumerable: true,
    get() {
      getterReads += 1;
      return { id: 'unsafe', type: 'projector', capabilities: [], simulated: true };
    },
  });

  await assert.rejects(
    () => dispatchHolographicDisplaySession({ session, adapter }),
    /adapter\.device must not use accessors/,
  );
  assert.equal(getterReads, 0);
});

test('dispatch rejects non-serializable or circular adapter evidence', async () => {
  const scene = createScene({ sceneId: 'dispatch-invalid-evidence-scene', nodes: [] });
  const session = createDisplaySession({ scene, sessionId: 'dispatch-invalid-evidence-session' });

  await assert.rejects(
    () => dispatchHolographicDisplaySession({
      session,
      adapter: { async render() { return { bad: () => true }; } },
    }),
    /JSON-compatible evidence/,
  );

  const circular = { status: 'rendered' };
  circular.self = circular;
  await assert.rejects(
    () => dispatchHolographicDisplaySession({
      session,
      adapter: { async render() { return circular; } },
    }),
    /circular references/,
  );
});

test('dispatch rejects hidden and accessor-backed evidence without evaluating getters', async () => {
  const scene = createScene({ sceneId: 'dispatch-hidden-evidence-scene', nodes: [] });
  const session = createDisplaySession({ scene, sessionId: 'dispatch-hidden-evidence-session' });

  const hidden = { status: 'rendered' };
  Object.defineProperty(hidden, 'secret', { value: 'hidden', enumerable: false });
  await assert.rejects(
    () => dispatchHolographicDisplaySession({
      session,
      adapter: { async render() { return hidden; } },
    }),
    /enumerable evidence/,
  );

  let getterReads = 0;
  const accessor = { status: 'rendered' };
  Object.defineProperty(accessor, 'dynamic', {
    enumerable: true,
    get() {
      getterReads += 1;
      return 'unsafe';
    },
  });
  await assert.rejects(
    () => dispatchHolographicDisplaySession({
      session,
      adapter: { async render() { return accessor; } },
    }),
    /must not use accessors/,
  );
  assert.equal(getterReads, 0);

  const symbolic = { status: 'rendered' };
  symbolic[Symbol('hidden')] = 'secret';
  await assert.rejects(
    () => dispatchHolographicDisplaySession({
      session,
      adapter: { async render() { return symbolic; } },
    }),
    /symbol properties/,
  );
});

test('dispatch verifier rejects accessor-backed receipts without evaluating getters', async () => {
  const scene = createScene({ sceneId: 'dispatch-verifier-accessor-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'dispatch-verifier-accessor-session' });
  const dispatch = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }) });

  let getterReads = 0;
  const deceptive = { ...dispatch };
  Object.defineProperty(deceptive, 'dispatchFingerprint', {
    enumerable: true,
    get() {
      getterReads += 1;
      return dispatch.dispatchFingerprint;
    },
  });

  assert.equal(verifyHolographicDispatchFingerprint(deceptive), false);
  assert.equal(getterReads, 0);
});

test('rejects a dispatch whose safety policy is inherited from a prototype', async () => {
  const scene = createScene({ sceneId: 'dispatch-prototype-safety-scene', nodes: [] });
  const session = createHolographicSurfaceSession({
    scene,
    sessionId: 'dispatch-prototype-safety-session',
  });
  const dispatch = await dispatchHolographicSurfaceSession({
    session,
    adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }),
  });
  const forgedSafety = Object.create({
    authoritative: false,
    physicalActuation: false,
    advisoryOnly: true,
  });

  assert.equal(
    verifyHolographicDispatchFingerprint({ ...dispatch, safety: forgedSafety }),
    false,
  );
});

test('rejects a dispatch whose safety object is missing an own invariant flag', async () => {
  const scene = createScene({ sceneId: 'dispatch-missing-safety-scene', nodes: [] });
  const session = createHolographicSurfaceSession({
    scene,
    sessionId: 'dispatch-missing-safety-session',
  });
  const dispatch = await dispatchHolographicSurfaceSession({
    session,
    adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }),
  });
  const partialSafety = { authoritative: false, physicalActuation: false };

  assert.equal(
    verifyHolographicDispatchFingerprint({ ...dispatch, safety: partialSafety }),
    false,
  );
});

test('rejects a prototype-backed dispatch envelope', async () => {
  const scene = createScene({ sceneId: 'dispatch-prototype-envelope-scene', nodes: [] });
  const session = createHolographicSurfaceSession({
    scene,
    sessionId: 'dispatch-prototype-envelope-session',
  });
  const dispatch = await dispatchHolographicSurfaceSession({
    session,
    adapter: new SimulatedHoloMatAdapter({ id: 'holo-mat-test' }),
  });
  const forgedDispatch = Object.create(dispatch);

  assert.equal(verifyHolographicDispatchFingerprint(forgedDispatch), false);
});
