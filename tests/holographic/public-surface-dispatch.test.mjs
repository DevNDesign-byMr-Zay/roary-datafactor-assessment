import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createScene, createDisplaySession, dispatchHolographicSurface, verifyHolographicDispatchFingerprint, SimulatedHoloMatAdapter, SimulatedProjectorAdapter, SimulatedThreeDPlatformAdapter } from '../../src/holographic/index.mjs';

const scene = createScene({ id: 'scene-public-1', title: 'Public surface fixture', nodes: [{ id: 'node-1', label: 'Grid', transform: { x: 1, y: 2, z: 3 } }] });
const displaySession = createDisplaySession({ scene, sessionId: 'public-surface-session' });

test('public surface dispatcher routes supported simulated surfaces', async () => {
  const cases = [
    [new SimulatedHoloMatAdapter({ id: 'mat-1' }), 'mapScene', 'mapped'],
    [new SimulatedProjectorAdapter({ id: 'projector-1' }), 'render', 'rendered'],
    [new SimulatedThreeDPlatformAdapter({ id: 'platform-1' }), 'stage', 'staged'],
  ];
  for (const [adapter, operation, status] of cases) {
    const result = await dispatchHolographicSurface({ session: displaySession, adapter, operation });
    assert.equal(result.result.status, status);
    assert.equal(result.safety.physicalActuation, false);
    assert.equal(result.safety.advisoryOnly, true);
  }
});

test('public surface dispatcher fails closed for unsupported operations', async () => {
  await assert.rejects(() => dispatchHolographicSurface({ session: displaySession, adapter: new SimulatedProjectorAdapter(), operation: 'stage' }), /operation not supported/);
});

test('dispatch evidence rejects tampered provenance and safety fields', async () => {
  const dispatch = await dispatchHolographicSurface({
    session: displaySession,
    adapter: new SimulatedProjectorAdapter({ id: 'projector-adversarial' }),
  });

  assert.equal(verifyHolographicDispatchFingerprint(dispatch), true);
  assert.equal(
    verifyHolographicDispatchFingerprint({ ...dispatch, sessionFingerprint: 'f'.repeat(64) }),
    false,
  );
  assert.equal(
    verifyHolographicDispatchFingerprint({
      ...dispatch,
      safety: { ...dispatch.safety, physicalActuation: true },
    }),
    false,
  );
  assert.equal(
    verifyHolographicDispatchFingerprint({ ...dispatch, sceneId: 'scene-swapped' }),
    false,
  );
});
