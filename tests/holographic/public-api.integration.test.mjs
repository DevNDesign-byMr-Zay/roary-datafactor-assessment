import { expect, test } from '@jest/globals';
import {
  createScene,
  createTransform,
  createHolographicInteractionEvent,
  createHolographicInteractionSession,
  validateHolographicInteractionSession,
} from '../../src/holographic/index.mjs';

test('public holographic API preserves advisory interaction boundary', () => {
  const scene = createScene({
    id: 'roary-public-api',
    nodes: [{ id: 'node-1', type: 'asset', transform: createTransform({ x: 1, y: 2, z: 3 }) }],
  });
  const event = createHolographicInteractionEvent({ sceneId: scene.id, nodeId: 'node-1', action: 'focus' });
  const session = createHolographicInteractionSession({ scene, events: [event], sessionId: 'public-api-session' });
  expect(validateHolographicInteractionSession(session)).toBe(true);
  expect(session.safety.authoritative).toBe(false);
  expect(session.safety.physicalActuation).toBe(false);
  expect(session.safety.advisoryOnly).toBe(true);
});
