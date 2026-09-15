import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import {
  createScene,
  createHolographicSurfaceSession,
  dispatchHolographicSurfaceSession,
  SimulatedHoloMatAdapter,
} from '../../src/holographic/index.mjs';

test('surface-session dispatch rejects a mutated session before adapter execution', async () => {
  const scene = createScene({ sceneId: 'integrity-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'integrity-session' });
  const tampered = {
    ...session,
    displaySession: { ...session.displaySession, sessionId: 'swapped-session' },
  };
  await assert.rejects(
    dispatchHolographicSurfaceSession({
      session: tampered,
      adapter: new SimulatedHoloMatAdapter({ id: 'integrity-adapter' }),
    }),
    /invalid holographic surface session/,
  );
});

test('surface-session dispatch preserves the validated session identity', async () => {
  const scene = createScene({ sceneId: 'identity-scene', nodes: [] });
  const session = createHolographicSurfaceSession({ scene, sessionId: 'identity-session' });
  const result = await dispatchHolographicSurfaceSession({
    session,
    adapter: new SimulatedHoloMatAdapter({ id: 'identity-adapter' }),
  });
  assert.equal(result.sessionId, session.sessionId);
  assert.equal(result.safety.advisoryOnly, true);
  assert.equal(result.safety.authoritative, false);
  assert.equal(result.safety.physicalActuation, false);
});
