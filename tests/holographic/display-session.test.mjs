import test from 'node:test';
import assert from 'node:assert/strict';
import { createDisplaySession, validateDisplaySession } from '../../src/holographic/display-session.mjs';

const scene = { sceneId: 'scene-1', snapshotId: 'snap-1', nodes: [{ id: 'node-1', transform: { x: 1, y: 2, z: 3 } }] };

test('creates and validates a renderer-neutral display session', () => {
  const session = createDisplaySession({ scene, sessionId: 'session-1', interactionEvents: [{ sceneId: 'scene-1', nodeId: 'node-1', action: 'focus' }] });
  assert.equal(session.sceneId, 'scene-1');
  assert.equal(session.safety.physicalActuation, false);
  assert.equal(validateDisplaySession(session), true);
});

test('rejects a tampered session packet', () => {
  const session = createDisplaySession({ scene, sessionId: 'session-1' });
  assert.equal(validateDisplaySession({ ...session, sceneId: 'other' }), false);
});
