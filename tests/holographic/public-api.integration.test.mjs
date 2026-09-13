import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createScene,
  createTransform,
  createHolographicInteractionEvent,
  createHolographicInteractionSession,
  validateHolographicInteractionSession,
} from '../../src/holographic/index.mjs';

test('public holographic API preserves advisory interaction boundary', () => {
  const scene = createScene({
    sceneId: 'roary-public-api',
    snapshotId: 'snapshot-1',
    provenanceRef: 'prov-1',
    transforms: [createTransform({ nodeId: 'node-1', x: 1, y: 2, z: 3 })],
  });
  const event = createHolographicInteractionEvent({ sceneId: scene.sceneId, nodeId: 'node-1', action: 'focus' });
  const session = createHolographicInteractionSession({ scene, events: [event] });
  assert.equal(validateHolographicInteractionSession(session), true);
  assert.equal(session.safety.authoritative, false);
  assert.equal(session.safety.physicalActuation, false);
  assert.equal(session.safety.advisoryOnly, true);
});
