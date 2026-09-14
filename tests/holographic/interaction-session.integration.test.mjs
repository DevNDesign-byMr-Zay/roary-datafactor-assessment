import { expect, test } from '@jest/globals';
import { createScene, createTransform } from '../../src/holographic/contracts.mjs';
import { createHolographicInteractionEvent } from '../../src/holographic/interaction.mjs';
import { createHolographicInteractionSession, validateHolographicInteractionSession } from '../../src/holographic/interaction-session.mjs';

test('interaction session stays renderer-neutral and validates its event chain', () => {
  const scene = createScene({ id: 'scene-session', nodes: [{ id: 'node-1', type: 'asset', transform: createTransform({ x: 1, y: 2, z: 3 }) }] });
  const event = createHolographicInteractionEvent({ sceneId: scene.id, nodeId: 'node-1', action: 'focus', source: 'operator-view' });
  const session = createHolographicInteractionSession({ scene, events: [event], sessionId: 'session-1' });

  expect(validateHolographicInteractionSession(session)).toBe(true);
  expect(session.safety.authoritative).toBe(false);
  expect(session.safety.physicalActuation).toBe(false);
  expect(session.safety.advisoryOnly).toBe(true);
  expect(session.events).toHaveLength(1);
});
