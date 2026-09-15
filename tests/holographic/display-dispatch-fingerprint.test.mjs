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
  assert.equal(Object.isFrozen(dispatch.result), true);
  assert.equal(Object.isFrozen(dispatch.result.metrics), true);
  assert.equal(Object.isFrozen(dispatch.result.tags), true);
  assert.equal(dispatch.dispatchFingerprint, originalFingerprint);
  assert.equal(verifyHolographicDispatchFingerprint(dispatch), true);
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
