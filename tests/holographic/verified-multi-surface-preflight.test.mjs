import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchAndSealHolographicSurfaces } from '../../src/holographic/verified-multi-surface-dispatch.mjs';

const scene = {
  sceneId: 'scene-batch-preflight',
  snapshotId: 'snapshot-batch-preflight',
  nodes: [{ id: 'node-1', transform: { x: 0, y: 0, z: 0 } }],
};

function device(id, type) {
  return Object.freeze({ id, type, simulated: true, capabilities: Object.freeze([]) });
}

test('rejects a later invalid adapter before any earlier renderer is invoked', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-batch-preflight' });
  let firstRendererCalls = 0;

  const first = {
    device: device('projector-1', 'projector'),
    async render(renderScene) {
      firstRendererCalls += 1;
      return { deviceId: 'projector-1', sceneId: renderScene.sceneId, status: 'rendered' };
    },
  };
  const invalidLaterAdapter = {
    device: device('holomat-2', 'holomat'),
    render() {
      return { status: 'wrong-operation' };
    },
  };

  await assert.rejects(
    dispatchAndSealHolographicSurfaces({ session, adapters: [first, invalidLaterAdapter] }),
    /operation not supported: mapScene/,
  );
  assert.equal(firstRendererCalls, 0);
});

test('rejects accessor-backed operations during preflight without invoking them', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-accessor-preflight' });
  let getterReads = 0;
  const adapter = { device: device('projector-accessor', 'projector') };
  Object.defineProperty(adapter, 'render', {
    enumerable: true,
    get() {
      getterReads += 1;
      return async () => ({ status: 'rendered' });
    },
  });

  await assert.rejects(
    dispatchAndSealHolographicSurfaces({ session, adapters: [adapter] }),
    /operation not supported: render/,
  );
  assert.equal(getterReads, 0);
});
