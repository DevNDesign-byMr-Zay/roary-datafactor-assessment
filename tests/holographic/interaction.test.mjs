import test from 'node:test';
import assert from 'node:assert/strict';

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
  assert.equal(event.action, 'focus');
  assert.equal(event.advisoryOnly, true);
  assert.equal(event.physicalActuation, false);
});

test('resolves an interaction without mutating the scene', () => {
  const result = resolveHolographicInteraction(scene, {
    sceneId: 'scene-001', nodeId: 'title', action: 'inspect',
  });
  assert.equal(result.handled, true);
  assert.equal(result.node.id, 'title');
  assert.equal(result.physicalActuation, false);
  assert.deepEqual(scene.nodes[0].transform, { x: 0, y: 0, z: 1 });
});

test('fails closed for unknown actions and mismatched scenes', () => {
  assert.throws(
    () => createHolographicInteractionEvent({ sceneId: 'scene-001', nodeId: 'title', action: 'launch' }),
    /Unsupported holographic action/,
  );
  assert.throws(
    () => resolveHolographicInteraction(scene, { sceneId: 'other', nodeId: 'title', action: 'focus' }),
    /must match/,
  );
});

test('reports an unknown node without inventing a target', () => {
  const result = resolveHolographicInteraction(scene, {
    sceneId: 'scene-001', nodeId: 'missing', action: 'focus',
  });
  assert.equal(result.handled, false);
  assert.equal(result.node, null);
});
