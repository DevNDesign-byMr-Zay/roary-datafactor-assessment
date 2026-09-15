import { expect, test } from '@jest/globals';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchHolographicDisplaySession } from '../../src/holographic/display-dispatch.mjs';
import { SimulatedProjectorAdapter } from '../../src/holographic/adapters.mjs';
import {
  createVerifiedHolographicDispatchRecord,
  validateVerifiedHolographicDispatchRecord,
} from '../../src/holographic/verified-dispatch-record.mjs';

async function fixture(adapterId = 'projector-a') {
  const scene = createScene({
    id: 'verified-dispatch-scene',
    nodes: [
      {
        id: 'asset-a',
        label: 'Asset A',
        position: { x: 1, y: 2, z: 3 },
        capabilities: ['topology'],
      },
    ],
  });
  const session = createDisplaySession({ scene, sessionId: 'verified-dispatch-session' });
  const adapter = new SimulatedProjectorAdapter({
    id: adapterId,
    capabilities: ['topology'],
  });
  const dispatch = await dispatchHolographicDisplaySession({
    session,
    adapter,
    operation: 'render',
    surfaceType: 'projector',
  });
  return { scene, session, adapter, dispatch };
}

test('creates one immutable handoff only after session and device verification', async () => {
  const artifacts = await fixture();
  const record = createVerifiedHolographicDispatchRecord(artifacts);

  expect(record.recordFingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(record.dispatchFingerprint).toBe(artifacts.dispatch.dispatchFingerprint);
  expect(record.sessionFingerprint).toBe(artifacts.session.sessionFingerprint);
  expect(record.sourcePacketFingerprint).toBe(artifacts.session.packet.fingerprint);
  expect(record.adapterDevice).toEqual(artifacts.dispatch.adapterDevice);
  expect(record.verification).toBe('session-and-device-bound');
  expect(record.safety).toEqual({
    advisoryOnly: true,
    authoritative: false,
    physicalActuation: false,
  });
  expect(Object.isFrozen(record)).toBe(true);
  expect(Object.isFrozen(record.adapterDevice)).toBe(true);
  expect(validateVerifiedHolographicDispatchRecord(record, artifacts)).toBe(true);
});

test('rejects replay against another valid device', async () => {
  const artifacts = await fixture('projector-a');
  const record = createVerifiedHolographicDispatchRecord(artifacts);
  const otherAdapter = new SimulatedProjectorAdapter({
    id: 'projector-b',
    capabilities: ['topology'],
  });

  expect(
    validateVerifiedHolographicDispatchRecord(record, {
      ...artifacts,
      adapter: otherAdapter,
    }),
  ).toBe(false);
  expect(() =>
    createVerifiedHolographicDispatchRecord({
      ...artifacts,
      adapter: otherAdapter,
    }),
  ).toThrow(/verified adapter device/);
});

test('rejects replay against another valid session', async () => {
  const artifacts = await fixture();
  const record = createVerifiedHolographicDispatchRecord(artifacts);
  const otherSession = createDisplaySession({
    scene: artifacts.scene,
    sessionId: 'other-session',
  });

  expect(
    validateVerifiedHolographicDispatchRecord(record, {
      ...artifacts,
      session: otherSession,
    }),
  ).toBe(false);
});

test('rejects record tampering and deceptive descriptors', async () => {
  const artifacts = await fixture();
  const record = createVerifiedHolographicDispatchRecord(artifacts);

  expect(
    validateVerifiedHolographicDispatchRecord(
      { ...record, safety: { ...record.safety, authoritative: true } },
      artifacts,
    ),
  ).toBe(false);
  expect(
    validateVerifiedHolographicDispatchRecord(
      { ...record, dispatchFingerprint: '0'.repeat(64) },
      artifacts,
    ),
  ).toBe(false);

  let getterReads = 0;
  const deceptive = { ...record };
  Object.defineProperty(deceptive, 'recordFingerprint', {
    enumerable: true,
    get() {
      getterReads += 1;
      return record.recordFingerprint;
    },
  });
  expect(validateVerifiedHolographicDispatchRecord(deceptive, artifacts)).toBe(false);
  expect(getterReads).toBe(0);
});
