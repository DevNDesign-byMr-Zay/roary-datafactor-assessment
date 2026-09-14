import { expect, test } from '@jest/globals';

import {
  createHolographicInteractionEvent,
  resolveHolographicInteraction,
} from '../../src/holographic/interaction.mjs';

const scene = {
  id: 'scene-001',
  nodes: [{ id: 'title', type: 'content', transform: { x: 0, y: 0, z: 1 } }],
};

test('normalizes a safe interaction event', () => {
  const event = createHolographicInteractionEvent({
    sceneId: 'scene-001', nodeId: 'title', action: 'focus',
  });
  expect(event.action).toBe('focus');
  expect(event.advisoryOnly).toBe(true);
  expect(event.physicalActuation).toBe(false);
});

test('resolves an interaction without mutating the scene', () => {
  const result = resolveHolographicInteraction(scene, {
    sceneId: 'scene-001', nodeId: 'title', action: 'inspect',
  });
  expect(result.handled).toBe(true);
  expect(result.node.id).toBe('title');
  expect(result.physicalActuation).toBe(false);
  expect(scene.nodes[0].transform).toEqual({ x: 0, y: 0, z: 1 });
});

test('fails closed for unknown actions and mismatched scenes', () => {
  expect(() => createHolographicInteractionEvent({ sceneId: 'scene-001', nodeId: 'title', action: 'launch' })).toThrow(/Unsupported holographic action/);
  expect(() => resolveHolographicInteraction(scene, { sceneId: 'other', nodeId: 'title', action: 'focus' })).toThrow(/must match/);
});

test('reports an unknown node without inventing a target', () => {
  const result = resolveHolographicInteraction(scene, {
    sceneId: 'scene-001', nodeId: 'missing', action: 'focus',
  });
  expect(result.handled).toBe(false);
  expect(result.node).toBeNull();
});
