import { expect, test } from '@jest/globals';
import { createDisplaySession, validateDisplaySession } from '../../src/holographic/display-session.mjs';

const scene = { id: 'scene-1', nodes: [{ id: 'node-1', transform: { x: 1, y: 2, z: 3 } }] };
const calibrationProfile = { width: 1000, height: 500, originX: 10, originY: 20, scaleX: 2, scaleY: 3, depthScale: 4 };

test('creates and validates a renderer-neutral display session', () => {
  const session = createDisplaySession({ scene, calibrationProfile, sessionId: 'session-1', interactionEvents: [{ sceneId: 'scene-1', nodeId: 'node-1', action: 'focus' }] });
  expect(session.sceneId).toBe('scene-1');
  expect(session.packet.calibrationProfile.scaleX).toBe(2);
  expect(session.packet.interactionEvents[0].action).toBe('focus');
  expect(session.safety.physicalActuation).toBe(false);
  expect(validateDisplaySession(session)).toBe(true);
});

test('preserves calibration and interaction data deterministically', () => {
  const a = createDisplaySession({ scene, calibrationProfile, sessionId: 'session-1', interactionEvents: [{ sceneId: 'scene-1', nodeId: 'node-1', action: 'inspect' }] });
  const b = createDisplaySession({ scene, calibrationProfile, sessionId: 'session-1', interactionEvents: [{ sceneId: 'scene-1', nodeId: 'node-1', action: 'inspect' }] });
  expect(a.packet).toEqual(b.packet);
});

test('rejects a tampered session packet', () => {
  const session = createDisplaySession({ scene, sessionId: 'session-1' });
  expect(validateDisplaySession({ ...session, sceneId: 'other' })).toBe(false);
  expect(validateDisplaySession({ ...session, safety: { ...session.safety, physicalActuation: true } })).toBe(false);
});
