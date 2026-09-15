import { test } from '@jest/globals';
import assert from 'node:assert/strict';

import {
  createCalibrationProfile,
  createDisplaySession,
  createHolographicInteractionEvent,
  createScene,
  mapSceneToDisplay,
  validateDisplaySession,
} from '../../src/holographic/index.mjs';

test('builds a calibrated interaction-aware display session without mutating the scene', () => {
  const scene = createScene({
    id: 'roary-session-001',
    nodes: [{ id: 'focus-node', transform: { x: 2, y: 3, z: 4 } }],
  });
  const calibration = createCalibrationProfile({
    width: 1000,
    height: 800,
    originX: 10,
    originY: 20,
    scaleX: 2,
    scaleY: 3,
    depthScale: 4,
  });
  const displayScene = mapSceneToDisplay(scene, calibration);
  const event = createHolographicInteractionEvent({
    sceneId: scene.id,
    nodeId: 'focus-node',
    action: 'focus',
    source: 'test-harness',
  });
  const session = createDisplaySession({
    scene: displayScene,
    calibrationProfile: calibration,
    interactionEvents: [event],
    sessionId: 'session-001',
  });

  assert.equal(session.sceneId, scene.id);
  assert.equal(session.packet.calibrationProfile.scaleX, 2);
  assert.equal(session.packet.interactionEvents[0].action, 'focus');
  assert.equal(session.packet.safety.physicalActuation, false);
  assert.equal(validateDisplaySession(session), true);
  assert.deepEqual(scene.nodes[0].transform, { x: 2, y: 3, z: 4 });
});

test('rejects a session whose packet identity has been tampered with', () => {
  const scene = createScene({
    id: 'roary-session-002',
    nodes: [{ id: 'node', transform: { x: 1, y: 1, z: 1 } }],
  });
  const session = createDisplaySession({ scene, sessionId: 'session-002' });
  assert.equal(validateDisplaySession({ ...session, sceneId: 'other-scene' }), false);
});
