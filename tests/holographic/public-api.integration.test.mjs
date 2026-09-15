import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import {
  HolographicBatchDispatchError,
  createDisplaySession,
  createScene,
  createTransform,
  createHolographicInteractionEvent,
  createHolographicInteractionSession,
  dispatchAndSealHolographicSurfaces,
  validateHolographicInteractionSession,
} from '../../src/holographic/index.mjs';

test('public holographic API preserves advisory interaction boundary', () => {
  const scene = createScene({
    sceneId: 'roary-public-api',
    snapshotId: 'snapshot-1',
    provenanceRef: 'prov-1',
    nodes: [{ id: 'node-1', transform: createTransform({ x: 1, y: 2, z: 3 }) }],
  });
  const event = createHolographicInteractionEvent({ sceneId: scene.sceneId, nodeId: 'node-1', action: 'focus' });
  const session = createHolographicInteractionSession({ scene, events: [event], sessionId: 'public-api-session' });
  assert.equal(validateHolographicInteractionSession(session), true);
  assert.equal(session.safety.authoritative, false);
  assert.equal(session.safety.physicalActuation, false);
  assert.equal(session.safety.advisoryOnly, true);
});

test('public sealed dispatcher exposes typed immutable partial failure evidence', async () => {
  const scene = createScene({
    id: 'public-batch-scene',
    nodes: [{ id: 'node-1', transform: createTransform({ x: 0, y: 0, z: 0 }) }],
  });
  const session = createDisplaySession({ scene, sessionId: 'public-batch-session' });
  const projector = {
    device: { id: 'public-projector', type: 'projector', capabilities: [] },
    async render(renderScene) {
      return { status: 'rendered', sceneId: renderScene.id };
    },
  };
  const failingHoloMat = {
    device: { id: 'public-holomat', type: 'holomat', capabilities: [] },
    async mapScene() {
      throw new Error('public renderer rejection');
    },
  };

  await assert.rejects(
    dispatchAndSealHolographicSurfaces({
      session,
      adapters: [projector, failingHoloMat],
    }),
    (error) => {
      assert.equal(error instanceof HolographicBatchDispatchError, true);
      assert.equal(error.phase, 'dispatch');
      assert.equal(error.failedIndex, 1);
      assert.equal(error.failedDeviceId, 'public-holomat');
      assert.equal(error.partialDispatches.length, 1);
      assert.equal(error.partialDispatches[0].deviceId, 'public-projector');
      assert.match(error.partialDispatches[0].dispatchFingerprint, /^[a-f0-9]{64}$/);
      assert.equal(Object.isFrozen(error), true);
      assert.equal(Object.isFrozen(error.partialDispatches), true);
      return true;
    },
  );
});
