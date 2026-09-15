import { expect, it } from '@jest/globals';
import {
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
} from '../../src/holographic/adapters.mjs';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { validateHolographicDispatchBatchReceipt } from '../../src/holographic/dispatch-batch-receipt.mjs';
import { dispatchAndSealHolographicSurfaces } from '../../src/holographic/verified-multi-surface-dispatch.mjs';

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
