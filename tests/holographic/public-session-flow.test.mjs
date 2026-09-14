import { describe, expect, test } from '@jest/globals';
import {
  createScene,
  createHolographicInteractionSession,
  resolveInteractionSessionEvent,
  validateHolographicInteractionSession,
} from '../../src/holographic/index.mjs';

describe('public holographic session flow', () => {
  test('creates and resolves an advisory interaction without mutating the scene', () => {
    const scene = createScene({
      id: 'scene-1',
      nodes: [{ id: 'node-1', type: 'asset', transform: { x: 1, y: 2, z: 3, scale: 1 } }],
    });
    const session = createHolographicInteractionSession({ scene, sessionId: 'session-1' });
    expect(validateHolographicInteractionSession(session)).toBe(true);
    const result = resolveInteractionSessionEvent({ scene, session, event: { sceneId: scene.id, nodeId: 'node-1', action: 'inspect', source: 'operator' } });
    expect(result.handled).toBe(true);
    expect(result.nodeId).toBe('node-1');
    expect(result.physicalActuation).toBe(false);
    expect(result.advisoryOnly).toBe(true);
    expect(scene.nodes[0].transform.z).toBe(3);
  });
});
