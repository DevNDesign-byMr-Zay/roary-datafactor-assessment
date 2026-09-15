import assert from 'node:assert/strict';
import { createScene, createHolographicSurfaceSession, dispatchHolographicSurfaceSession, SimulatedHoloMatAdapter } from '../../src/holographic/index.mjs';
import { createDisplaySession, validateDisplaySession } from '../../src/holographic/display-session.mjs';

test('surface-session dispatch rejects a mutated session before adapter execution', async () => {
  const scene = createScene({ id: 'integrity-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'integrity-session' });
  const tampered = { ...session, displaySession: { ...session.displaySession, sessionId: 'swapped-session' } };
  await assert.rejects(
    dispatchHolographicSurfaceSession({ session: tampered, adapter: new SimulatedHoloMatAdapter({ id: 'integrity-adapter' }) }),
    /invalid holographic surface session/,
  );
});

test('surface-session dispatch preserves the validated session identity', async () => {
  const scene = createScene({ id: 'identity-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'identity-session' });
  const result = await dispatchHolographicSurfaceSession({ session, adapter: new SimulatedHoloMatAdapter({ id: 'identity-adapter' }) });
  assert.equal(result.sessionId, session.sessionId);
  assert.equal(result.safety.advisoryOnly, true);
  assert.equal(result.safety.authoritative, false);
  assert.equal(result.safety.physicalActuation, false);
});

test('display-session validation rejects a cross-session packet replay', () => {
  const sceneA = createScene({ id: 'replay-scene-a', nodes: [] });
  const sceneB = createScene({ id: 'replay-scene-b', nodes: [] });
  const sessionA = createDisplaySession({ scene: sceneA, sessionId: 'session-a' });
  const sessionB = createDisplaySession({ scene: sceneB, sessionId: 'session-b' });
  const replay = { ...sessionB, packet: sessionA.packet, sceneId: sessionA.sceneId };
  assert.equal(validateDisplaySession(sessionA), true);
  assert.equal(validateDisplaySession(sessionB), true);
  assert.equal(validateDisplaySession(replay), false);
});

test('display-session validation rejects identity swapping without a new fingerprint', () => {
  const scene = createScene({ id: 'identity-swap-scene', nodes: [] });
  const session = createDisplaySession({ scene, sessionId: 'original-session' });
  const swapped = { ...session, sessionId: 'attacker-session' };
  assert.equal(validateDisplaySession(session), true);
  assert.equal(validateDisplaySession(swapped), false);
});
