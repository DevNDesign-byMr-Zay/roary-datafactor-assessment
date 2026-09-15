import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createDisplaySession, validateDisplaySession } from '../../src/holographic/display-session.mjs';

const scene = { sceneId: 'scene-1', snapshotId: 'snap-1', nodes: [{ id: 'node-1', transform: { x: 1, y: 2, z: 3 } }] };
const calibrationProfile = { width: 1000, height: 500, originX: 10, originY: 20, scaleX: 2, scaleY: 3, depthScale: 4 };

test('creates and validates a renderer-neutral display session', () => {
  const session = createDisplaySession({ scene, calibrationProfile, sessionId: 'session-1', interactionEvents: [{ sceneId: 'scene-1', nodeId: 'node-1', action: 'focus' }] });
  assert.equal(session.sceneId, 'scene-1');
  assert.equal(session.packet.calibrationProfile.scaleX, 2);
  assert.equal(session.packet.interactionEvents[0].action, 'focus');
  assert.equal(session.safety.physicalActuation, false);
  assert.match(session.sessionFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(Object.isFrozen(session.safety), true);
  assert.equal(validateDisplaySession(session), true);
});

test('preserves calibration, interaction, and session lineage deterministically', () => {
  const a = createDisplaySession({ scene, calibrationProfile, sessionId: 'session-1', interactionEvents: [{ sceneId: 'scene-1', nodeId: 'node-1', action: 'inspect' }] });
  const b = createDisplaySession({ scene, calibrationProfile, sessionId: 'session-1', interactionEvents: [{ sceneId: 'scene-1', nodeId: 'node-1', action: 'inspect' }] });
  assert.deepEqual(a.packet, b.packet);
  assert.equal(a.sessionFingerprint, b.sessionFingerprint);
});

test('rejects tampered session identity, packet lineage, safety, and fingerprint', () => {
  const session = createDisplaySession({ scene, sessionId: 'session-1' });
  assert.equal(validateDisplaySession({ ...session, sceneId: 'other' }), false);
  assert.equal(validateDisplaySession({ ...session, sessionId: 'session-2' }), false);
  assert.equal(validateDisplaySession({ ...session, safety: { ...session.safety, physicalActuation: true } }), false);
  assert.equal(validateDisplaySession({ ...session, sessionFingerprint: '0'.repeat(64) }), false);
  assert.equal(
    validateDisplaySession({
      ...session,
      packet: { ...session.packet, fingerprint: '0'.repeat(64) },
    }),
    false,
  );
});

test('rejects deceptive session descriptors without executing getters', () => {
  const session = createDisplaySession({ scene, sessionId: 'session-1' });
  let getterReads = 0;
  const deceptive = { ...session };
  Object.defineProperty(deceptive, 'sessionFingerprint', {
    enumerable: true,
    get() {
      getterReads += 1;
      return session.sessionFingerprint;
    },
  });

  assert.equal(validateDisplaySession(deceptive), false);
  assert.equal(getterReads, 0);

  const hidden = { ...session };
  Object.defineProperty(hidden, 'authority', { enumerable: false, value: true });
  assert.equal(validateDisplaySession(hidden), false);

  const symbolic = { ...session };
  symbolic[Symbol('authority')] = true;
  assert.equal(validateDisplaySession(symbolic), false);
});
