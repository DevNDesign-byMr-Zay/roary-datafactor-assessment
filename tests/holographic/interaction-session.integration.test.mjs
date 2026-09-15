import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createScene, createTransform } from '../../src/holographic/contracts.mjs';
import { createHolographicInteractionEvent } from '../../src/holographic/interaction.mjs';
import { createHolographicInteractionSession, validateHolographicInteractionSession } from '../../src/holographic/interaction-session.mjs';

test('interaction session stays renderer-neutral and validates its event chain', () => {
  const scene = createScene({ sceneId: 'scene-session', nodes: [{ id: 'node-1', kind: 'asset', transform: createTransform({ x: 1, y: 2, z: 3 }) }] });
  const event = createHolographicInteractionEvent({ sceneId: scene.sceneId, nodeId: 'node-1', action: 'focus', source: 'operator-view' });
  const session = createHolographicInteractionSession({ scene, interactionEvents: [event], sessionId: 'session-1' });

  assert.equal(validateHolographicInteractionSession(session), true);
  assert.equal(session.safety.authoritative, false);
  assert.equal(session.safety.physicalActuation, false);
  assert.equal(session.safety.advisoryOnly, true);
  assert.equal(session.events.length, 1);
});
