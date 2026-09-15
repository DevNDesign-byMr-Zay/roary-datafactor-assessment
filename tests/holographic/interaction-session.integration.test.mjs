import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createScene, createTransform } from '../../src/holographic/contracts.mjs';
import { createHolographicInteractionEvent } from '../../src/holographic/interaction.mjs';
import {
  createHolographicInteractionSession,
  validateHolographicInteractionSession,
} from '../../src/holographic/interaction-session.mjs';

function fixture() {
  const scene = createScene({
    sceneId: 'scene-session',
    nodes: [{ id: 'node-1', kind: 'asset', transform: createTransform({ x: 1, y: 2, z: 3 }) }],
  });
  const event = createHolographicInteractionEvent({
    sceneId: scene.sceneId,
    nodeId: 'node-1',
    action: 'focus',
    source: 'operator-view',
  });
  const session = createHolographicInteractionSession({
    scene,
    interactionEvents: [event],
    sessionId: 'session-1',
  });
  return { scene, event, session };
}

test('interaction session stays renderer-neutral and validates its event chain', () => {
  const { session } = fixture();

  assert.equal(validateHolographicInteractionSession(session), true);
  assert.equal(session.safety.authoritative, false);
  assert.equal(session.safety.physicalActuation, false);
  assert.equal(session.safety.advisoryOnly, true);
  assert.equal(session.events.length, 1);
  assert.equal(Object.isFrozen(session.events), true);
});

test('rejects packet or event lineage drift around an otherwise valid display session', () => {
  const { session } = fixture();

  assert.equal(
    validateHolographicInteractionSession({
      ...session,
      packet: { ...session.packet, fingerprint: '0'.repeat(64) },
    }),
    false,
  );
  assert.equal(validateHolographicInteractionSession({ ...session, events: [] }), false);
});

test('rejects deceptive interaction-session descriptors without executing getters', () => {
  const { session } = fixture();
  let sessionGetterReads = 0;
  let eventGetterReads = 0;

  const deceptiveSession = { ...session };
  Object.defineProperty(deceptiveSession, 'events', {
    enumerable: true,
    get() {
      sessionGetterReads += 1;
      return session.events;
    },
  });
  assert.equal(validateHolographicInteractionSession(deceptiveSession), false);
  assert.equal(sessionGetterReads, 0);

  const deceptiveEvent = { ...session.events[0] };
  Object.defineProperty(deceptiveEvent, 'action', {
    enumerable: true,
    get() {
      eventGetterReads += 1;
      return session.events[0].action;
    },
  });
  assert.equal(validateHolographicInteractionSession({ ...session, events: [deceptiveEvent] }), false);
  assert.equal(eventGetterReads, 0);
});

test('rejects extra fields, alternate prototypes, and decorated event arrays', () => {
  const { session } = fixture();

  assert.equal(validateHolographicInteractionSession({ ...session, authority: true }), false);
  assert.equal(validateHolographicInteractionSession(Object.create(session)), false);

  const decoratedEvents = [...session.events];
  decoratedEvents.shadowAuthority = true;
  assert.equal(
    validateHolographicInteractionSession({ ...session, events: decoratedEvents }),
    false,
  );
});

test('creation rejects accessor-backed event slots without evaluating them', () => {
  const { scene, event } = fixture();
  let getterReads = 0;
  const events = [];
  Object.defineProperty(events, '0', {
    enumerable: true,
    configurable: true,
    get() {
      getterReads += 1;
      return event;
    },
  });
  events.length = 1;

  assert.throws(
    () =>
      createHolographicInteractionSession({
        scene,
        interactionEvents: events,
        sessionId: 'session-accessor',
      }),
    /must not use accessors/,
  );
  assert.equal(getterReads, 0);
});
