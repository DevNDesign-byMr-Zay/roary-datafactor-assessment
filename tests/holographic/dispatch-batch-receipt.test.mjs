import { expect, it } from '@jest/globals';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createCalibrationProfile } from '../../src/holographic/calibration.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchHolographicDisplaySession } from '../../src/holographic/display-dispatch.mjs';
import {
  createHolographicDispatchBatchReceipt,
  validateHolographicDispatchBatchReceipt,
} from '../../src/holographic/dispatch-batch-receipt.mjs';
import {
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
} from '../../src/holographic/adapters.mjs';

function createFixture() {
  const scene = createScene({
    id: 'dispatch-batch-scene',
    nodes: [
      {
        id: 'asset-a',
        label: 'Asset A',
        position: { x: 1, y: 2, z: 3 },
        capabilities: ['topology'],
      },
    ],
  });
  const calibrationProfile = createCalibrationProfile({
    width: 1920,
    height: 1080,
    scaleX: 1,
    scaleY: 1,
    depthScale: 1,
  });
  const session = createDisplaySession({
    scene,
    calibrationProfile,
    sessionId: 'dispatch-batch-session',
  });
  const adapters = [
    new SimulatedHoloMatAdapter({ id: 'batch-mat', capabilities: ['topology'] }),
    new SimulatedProjectorAdapter({ id: 'batch-projector', capabilities: ['topology'] }),
    new SimulatedThreeDPlatformAdapter({ id: 'batch-three-d', capabilities: ['topology'] }),
  ];
  return { session, adapters };
}

async function dispatchFixture(session, adapters) {
  const operations = ['mapScene', 'render', 'stage'];
  const surfaceTypes = ['holo-mat', 'projector', 'three-d-platform'];
  return Promise.all(
    adapters.map((adapter, index) =>
      dispatchHolographicDisplaySession({
        session,
        adapter,
        operation: operations[index],
        surfaceType: surfaceTypes[index],
      }),
    ),
  );
}

it('seals a complete multi-surface dispatch batch to one session and exact devices', async () => {
  const { session, adapters } = createFixture();
  const dispatches = await dispatchFixture(session, adapters);
  const receipt = createHolographicDispatchBatchReceipt({ session, dispatches, adapters });

  expect(validateHolographicDispatchBatchReceipt(receipt, { session, dispatches, adapters })).toBe(
    true,
  );
  expect(receipt.dispatchCount).toBe(3);
  expect(receipt.dispatches.map((entry) => entry.deviceId)).toEqual([
    'batch-mat',
    'batch-projector',
    'batch-three-d',
  ]);
  expect(receipt.batchFingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(Object.isFrozen(receipt)).toBe(true);
  expect(Object.isFrozen(receipt.dispatches)).toBe(true);
  expect(receipt.safety).toEqual({
    authoritative: false,
    physicalActuation: false,
    advisoryOnly: true,
  });
});

it('rejects a valid dispatch substituted from another valid session', async () => {
  const { session, adapters } = createFixture();
  const dispatches = await dispatchFixture(session, adapters);
  const receipt = createHolographicDispatchBatchReceipt({ session, dispatches, adapters });
  const otherSession = createDisplaySession({
    scene: session.packet.scene,
    calibrationProfile: session.packet.calibrationProfile,
    sessionId: 'dispatch-batch-session-other',
  });
  const substitute = await dispatchHolographicDisplaySession({
    session: otherSession,
    adapter: adapters[1],
    operation: 'render',
    surfaceType: 'projector',
  });

  expect(
    validateHolographicDispatchBatchReceipt(receipt, {
      session,
      dispatches: [dispatches[0], substitute, dispatches[2]],
      adapters,
    }),
  ).toBe(false);
});

it('rejects adapter substitution even when the substitute adapter is otherwise valid', async () => {
  const { session, adapters } = createFixture();
  const dispatches = await dispatchFixture(session, adapters);
  const receipt = createHolographicDispatchBatchReceipt({ session, dispatches, adapters });
  const substituteAdapters = [
    adapters[0],
    new SimulatedProjectorAdapter({ id: 'batch-projector-other', capabilities: ['topology'] }),
    adapters[2],
  ];

  expect(
    validateHolographicDispatchBatchReceipt(receipt, {
      session,
      dispatches,
      adapters: substituteAdapters,
    }),
  ).toBe(false);
});

it('rejects duplicate dispatches and duplicate device identities before sealing', async () => {
  const { session, adapters } = createFixture();
  const dispatches = await dispatchFixture(session, adapters);

  expect(() =>
    createHolographicDispatchBatchReceipt({
      session,
      dispatches: [dispatches[0], dispatches[0]],
      adapters: [adapters[0], adapters[0]],
    }),
  ).toThrow(/duplicate dispatch fingerprints/);

  const duplicateDeviceAdapter = new SimulatedProjectorAdapter({
    id: 'batch-mat',
    capabilities: ['topology'],
  });
  const duplicateDeviceDispatch = await dispatchHolographicDisplaySession({
    session,
    adapter: duplicateDeviceAdapter,
    operation: 'render',
    surfaceType: 'projector',
  });
  expect(() =>
    createHolographicDispatchBatchReceipt({
      session,
      dispatches: [dispatches[0], duplicateDeviceDispatch],
      adapters: [adapters[0], duplicateDeviceAdapter],
    }),
  ).toThrow(/duplicate device identities/);
});

it('rejects authority widening and deceptive receipt descriptors without executing getters', async () => {
  const { session, adapters } = createFixture();
  const dispatches = await dispatchFixture(session, adapters);
  const receipt = createHolographicDispatchBatchReceipt({ session, dispatches, adapters });

  expect(
    validateHolographicDispatchBatchReceipt(
      { ...receipt, safety: { ...receipt.safety, authoritative: true } },
      { session, dispatches, adapters },
    ),
  ).toBe(false);

  let getterReads = 0;
  const accessorReceipt = { ...receipt };
  Object.defineProperty(accessorReceipt, 'batchFingerprint', {
    enumerable: true,
    get() {
      getterReads += 1;
      return receipt.batchFingerprint;
    },
  });
  expect(
    validateHolographicDispatchBatchReceipt(accessorReceipt, { session, dispatches, adapters }),
  ).toBe(false);
  expect(getterReads).toBe(0);
});
