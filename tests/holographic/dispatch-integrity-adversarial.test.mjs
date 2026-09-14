import { expect, test } from '@jest/globals';
import {
  createDisplaySession,
  createScene,
  dispatchHolographicDisplaySession,
  dispatchHolographicSurface,
  SimulatedHoloMatAdapter,
  verifyHolographicDispatchFingerprint,
} from '../../src/holographic/index.mjs';

function sessionFixture() {
  const scene = createScene({
    id: 'dispatch-adversarial-scene',
    nodes: [{ id: 'node-1', type: 'content', transform: { x: 1, y: 2, z: 3 } }],
  });
  return createDisplaySession({ scene, sessionId: 'dispatch-adversarial-session' });
}

async function dispatchFixture() {
  return dispatchHolographicSurface({
    session: sessionFixture(),
    adapter: new SimulatedHoloMatAdapter({ id: 'dispatch-adversarial-mat' }),
  });
}

test('final surface dispatch fingerprint covers routing and nested result evidence', async () => {
  const dispatch = await dispatchFixture();
  expect(verifyHolographicDispatchFingerprint(dispatch)).toBe(true);
  expect(verifyHolographicDispatchFingerprint({ ...dispatch, surfaceType: 'projector' })).toBe(false);
  expect(verifyHolographicDispatchFingerprint({ ...dispatch, sessionId: 'other-session' })).toBe(false);
  expect(
    verifyHolographicDispatchFingerprint({
      ...dispatch,
      result: { ...dispatch.result, status: 'rendered' },
    }),
  ).toBe(false);
});

test('authority or actuation tampering invalidates final dispatch evidence', async () => {
  const dispatch = await dispatchFixture();
  expect(
    verifyHolographicDispatchFingerprint({
      ...dispatch,
      safety: { ...dispatch.safety, authoritative: true },
    }),
  ).toBe(false);
  expect(
    verifyHolographicDispatchFingerprint({
      ...dispatch,
      safety: { ...dispatch.safety, physicalActuation: true },
    }),
  ).toBe(false);
});

test('adapter result evidence is defensively snapshotted and recursively frozen', async () => {
  const adapterResult = {
    status: 'rendered',
    diagnostics: { frameCount: 2, targets: ['left', 'right'] },
  };
  const adapter = {
    async render() {
      return adapterResult;
    },
  };

  const dispatch = await dispatchHolographicDisplaySession({
    session: sessionFixture(),
    adapter,
  });

  adapterResult.status = 'mutated';
  adapterResult.diagnostics.frameCount = 999;
  adapterResult.diagnostics.targets.push('late');

  expect(dispatch.result).toEqual({
    status: 'rendered',
    diagnostics: { frameCount: 2, targets: ['left', 'right'] },
  });
  expect(Object.isFrozen(dispatch)).toBe(true);
  expect(Object.isFrozen(dispatch.result)).toBe(true);
  expect(Object.isFrozen(dispatch.result.diagnostics)).toBe(true);
  expect(Object.isFrozen(dispatch.result.diagnostics.targets)).toBe(true);
  expect(verifyHolographicDispatchFingerprint(dispatch)).toBe(true);
});

test('dispatch issuance fails closed on unsupported or circular adapter evidence', async () => {
  await expect(
    dispatchHolographicDisplaySession({
      session: sessionFixture(),
      adapter: { async render() { return { status: 'rendered', execute: () => 'nope' }; } },
    }),
  ).rejects.toThrow(/JSON-compatible evidence/);

  const circular = { status: 'rendered' };
  circular.self = circular;
  await expect(
    dispatchHolographicDisplaySession({
      session: sessionFixture(),
      adapter: { async render() { return circular; } },
    }),
  ).rejects.toThrow(/circular references/);
});
