import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createScene, createTransform } from '../../src/holographic/index.mjs';
import { createHolographicInteractionSession, validateHolographicInteractionSession } from '../../src/holographic/interaction-session.mjs';

test('public holographic API preserves advisory interaction boundary', () => {
  const scene = createScene({
    sceneId: 'roary-public-api',
    snapshotId: 'snapshot-1',
    provenanceRef: 'prov-1',
    nodes: [{ id: 'node-1', transform: createTransform({ x: 1, y: 2, z: 3 }) }],
  });
  const event = { sceneId: scene.sceneId, nodeId: 'node-1', action: 'focus' };
  const session = createHolographicInteractionSession({ scene, events: [event] });
  assert.equal(validateHolographicInteractionSession(session), true);
  assert.equal(session.safety.authoritative, false);
  assert.equal(session.safety.physicalActuation, false);
  assert.equal(session.safety.advisoryOnly, true);
});
