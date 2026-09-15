import { describe, expect, it } from '@jest/globals';
import {
  createScene,
  createHolographicInteractionSession,
  resolveInteractionSessionEvent,
  validateHolographicInteractionSession,
} from '../../src/holographic/index.mjs';

describe('public holographic session flow', () => {
  it('creates and resolves an advisory interaction without mutating the scene', () => {
    const scene = createScene({
      id: 'scene-1',
      nodes: [{ id: 'node-1', label: 'Transformer', transform: { x: 1, y: 2, z: 3, scale: 1 } }],
    });
    const session = createHolographicInteractionSession({ scene, sessionId: 'session-1' });
    expect(validateHolographicInteractionSession(session)).toBe(true);
    const result = resolveInteractionSessionEvent({ scene, session, event: { sceneId: 'scene-1', nodeId: 'node-1', action: 'inspect', source: 'operator' } });
    expect(result.handled).toBe(true);
    expect(result.nodeId).toBe('node-1');
    expect(result.safety.physicalActuation).toBe(false);
    expect(scene.nodes[0].transform.z).toBe(3);
  });

  it('rejects a same-id scene with different content at session resolution', () => {
    const scene = createScene({
      id: 'scene-identity',
      nodes: [{ id: 'node-1', transform: { x: 1, y: 2, z: 3, scale: 1 } }],
    });
    const session = createHolographicInteractionSession({ scene, sessionId: 'scene-identity-session' });
    const swappedScene = createScene({
      id: 'scene-identity',
      nodes: [{ id: 'node-2', transform: { x: 9, y: 8, z: 7, scale: 1 } }],
    });

    expect(() => resolveInteractionSessionEvent({
      scene: swappedScene,
      session,
      event: { sceneId: 'scene-identity', nodeId: 'node-2', action: 'inspect', source: 'operator' },
    })).toThrow('scene must match the session scene');
  });
});
