import { expect, test } from '@jest/globals';
import {
  createDisplaySession,
  createScene,
  dispatchHolographicSurface,
  SimulatedHoloMatAdapter,
  verifyHolographicDispatchFingerprint,
} from '../../src/holographic/index.mjs';

async function dispatchFixture() {
  const scene = createScene({
    id: 'dispatch-adversarial-scene',
    nodes: [{ id: 'node-1', type: 'content', transform: { x: 1, y: 2, z: 3 } }],
  });
  const session = createDisplaySession({ scene, sessionId: 'dispatch-adversarial-session' });
  return dispatchHolographicSurface({
    session,
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
