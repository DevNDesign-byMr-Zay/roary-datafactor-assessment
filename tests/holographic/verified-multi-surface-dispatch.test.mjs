import { expect, it } from '@jest/globals';
import {
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
} from '../../src/holographic/adapters.mjs';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { validateHolographicDispatchBatchReceipt } from '../../src/holographic/dispatch-batch-receipt.mjs';
import {
  dispatchAndSealHolographicSurfaces,
  HolographicBatchDispatchError,
} from '../../src/holographic/verified-multi-surface-dispatch.mjs';

function sessionFixture() {
  return createDisplaySession({
    scene: createScene({
      id: 'sealed-batch-scene',
      nodes: [
        {
          id: 'node-1',
          label: 'Node 1',
          position: { x: 0, y: 0, z: 0 },
          capabilities: ['topology'],
        },
      ],
    }),
    sessionId: 'sealed-batch-session',
  });
}

it('returns renderer results only with a verified sealed multi-surface receipt', async () => {
  const session = sessionFixture();
  const adapters = [
    new SimulatedHoloMatAdapter({ id: 'mat-sealed', capabilities: ['topology'] }),
    new SimulatedProjectorAdapter({ id: 'projector-sealed', capabilities: ['topology'] }),
    new SimulatedThreeDPlatformAdapter({ id: 'three-d-sealed', capabilities: ['topology'] }),
  ];

  const batch = await dispatchAndSealHolographicSurfaces({ session, adapters });

  expect(batch.verification).toBe('dispatch-batch-sealed-before-return');
  expect(batch.sessionFingerprint).toBe(session.sessionFingerprint);
  expect(batch.dispatches.map((dispatch) => dispatch.result.status)).toEqual([
    'mapped',
    'rendered',
    'staged',
  ]);
  expect(
    validateHolographicDispatchBatchReceipt(batch.receipt, {
      session,
      dispatches: batch.dispatches,
      adapters,
    }),
  ).toBe(true);
  expect(batch.receipt.dispatchCount).toBe(3);
  expect(Object.isFrozen(batch)).toBe(true);
  expect(Object.isFrozen(batch.dispatches)).toBe(true);
});

it('rejects duplicate device identities before invoking any renderer', async () => {
  class CountingHoloMatAdapter {
    constructor(id) {
      this.device = { type: 'holomat', id, capabilities: ['topology'] };
      this.calls = 0;
    }

    mapScene(scene) {
      this.calls += 1;
      return { status: 'mapped', sceneId: scene.id };
    }
  }

  const session = sessionFixture();
  const first = new CountingHoloMatAdapter('duplicate-device');
  const second = new CountingHoloMatAdapter('duplicate-device');

  await expect(
    dispatchAndSealHolographicSurfaces({ session, adapters: [first, second] }),
  ).rejects.toThrow(/duplicate holographic device identity/);
  expect(first.calls).toBe(0);
  expect(second.calls).toBe(0);
});

it('rejects adapter drift after preflight before the changed renderer is invoked', async () => {
  const session = sessionFixture();
  let secondCalls = 0;
  const second = {
    device: { id: 'projector-drift', type: 'projector', capabilities: ['topology'] },
    render(scene) {
      secondCalls += 1;
      return { status: 'rendered', sceneId: scene.id };
    },
  };
  const replacementRender = second.render.bind(second);
  const first = {
    device: { id: 'mat-drift-source', type: 'holomat', capabilities: ['topology'] },
    async mapScene(scene) {
      second.render = replacementRender;
      return { status: 'mapped', sceneId: scene.id };
    },
  };

  let failure;
  try {
    await dispatchAndSealHolographicSurfaces({ session, adapters: [first, second] });
  } catch (error) {
    failure = error;
  }

  expect(failure).toBeInstanceOf(HolographicBatchDispatchError);
  expect(failure.phase).toBe('dispatch');
  expect(failure.failedIndex).toBe(1);
  expect(failure.failedDeviceId).toBe('projector-drift');
  expect(failure.partialDispatches).toHaveLength(1);
  expect(failure.partialDispatches[0].deviceId).toBe('mat-drift-source');
  expect(failure.partialDispatches[0].dispatchFingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(secondCalls).toBe(0);
  expect(Object.isFrozen(failure)).toBe(true);
  expect(Object.isFrozen(failure.partialDispatches)).toBe(true);
});

it('carries immutable partial provenance when a renderer rejects after preflight', async () => {
  const session = sessionFixture();
  let firstCalls = 0;
  let secondCalls = 0;
  const first = {
    device: { id: 'projector-partial', type: 'projector', capabilities: ['topology'] },
    async render(scene) {
      firstCalls += 1;
      return { status: 'rendered', sceneId: scene.id };
    },
  };
  const second = {
    device: { id: 'mat-runtime-failure', type: 'holomat', capabilities: ['topology'] },
    async mapScene() {
      secondCalls += 1;
      throw new Error('simulated renderer rejection');
    },
  };

  let failure;
  try {
    await dispatchAndSealHolographicSurfaces({ session, adapters: [first, second] });
  } catch (error) {
    failure = error;
  }

  expect(failure).toBeInstanceOf(HolographicBatchDispatchError);
  expect(failure.phase).toBe('dispatch');
  expect(failure.failedIndex).toBe(1);
  expect(failure.failedDeviceId).toBe('mat-runtime-failure');
  expect(failure.failureReason).toBe('simulated renderer rejection');
  expect(failure.partialDispatches).toHaveLength(1);
  expect(failure.partialDispatches[0]).toEqual({
    dispatchFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
    deviceId: 'projector-partial',
    deviceType: 'projector',
    operation: 'render',
    surfaceType: 'projector',
  });
  expect(firstCalls).toBe(1);
  expect(secondCalls).toBe(1);
});

it('does not execute a deceptive renderer error message getter', async () => {
  const session = sessionFixture();
  let getterReads = 0;
  const deceptiveError = new Error();
  Object.defineProperty(deceptiveError, 'message', {
    configurable: true,
    get() {
      getterReads += 1;
      return 'deceptive renderer message';
    },
  });
  const adapter = {
    device: { id: 'mat-deceptive-error', type: 'holomat', capabilities: ['topology'] },
    async mapScene() {
      throw deceptiveError;
    },
  };

  let failure;
  try {
    await dispatchAndSealHolographicSurfaces({ session, adapters: [adapter] });
  } catch (error) {
    failure = error;
  }

  expect(failure).toBeInstanceOf(HolographicBatchDispatchError);
  expect(failure.failureReason).toBe('holographic renderer failure');
  expect(failure.failedDeviceId).toBe('mat-deceptive-error');
  expect(failure.partialDispatches).toHaveLength(0);
  expect(getterReads).toBe(0);
});
