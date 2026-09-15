import { expect, it } from '@jest/globals';
import {
  HolographicBatchDispatchError,
  createDisplaySession,
  createHolographicBatchFailureEvidence,
  createScene,
  dispatchAndSealHolographicSurfaces,
  validateHolographicBatchFailureEvidence,
} from '../../src/holographic/index.mjs';

function sessionFixture() {
  return createDisplaySession({
    scene: createScene({
      id: 'failure-evidence-scene',
      nodes: [
        {
          id: 'node-1',
          label: 'Node 1',
          position: { x: 0, y: 0, z: 0 },
          capabilities: ['topology'],
        },
      ],
    }),
    sessionId: 'failure-evidence-session',
  });
}

async function failureFixture() {
  const session = sessionFixture();
  const first = {
    device: { id: 'projector-before-failure', type: 'projector', capabilities: ['topology'] },
    async render(scene) {
      return { status: 'rendered', sceneId: scene.id };
    },
  };
  const second = {
    device: { id: 'mat-failure', type: 'holomat', capabilities: ['topology'] },
    async mapScene() {
      throw new Error('simulated transportable renderer failure');
    },
  };

  try {
    await dispatchAndSealHolographicSurfaces({ session, adapters: [first, second] });
  } catch (error) {
    expect(error).toBeInstanceOf(HolographicBatchDispatchError);
    return error;
  }
  throw new Error('expected holographic batch failure');
}

it('projects typed batch failure into deterministic transport-safe evidence', async () => {
  const failure = await failureFixture();
  const evidence = createHolographicBatchFailureEvidence(failure);
  const transported = JSON.parse(JSON.stringify(evidence));

  expect(validateHolographicBatchFailureEvidence(evidence)).toBe(true);
  expect(validateHolographicBatchFailureEvidence(transported)).toBe(true);
  expect(evidence.failureFingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(evidence.sessionFingerprint).toBe(failure.sessionFingerprint);
  expect(evidence.failedDeviceId).toBe('mat-failure');
  expect(evidence.partialDispatches).toHaveLength(1);
  expect(evidence.safety).toEqual({
    authoritative: false,
    physicalActuation: false,
    automaticRetry: false,
    sealedSuccess: false,
  });
  expect(Object.isFrozen(evidence)).toBe(true);
  expect(Object.isFrozen(evidence.partialDispatches)).toBe(true);
});

it('rejects transported tampering and deceptive top-level accessors without executing getters', async () => {
  const evidence = createHolographicBatchFailureEvidence(await failureFixture());
  const tampered = JSON.parse(JSON.stringify(evidence));
  tampered.failedDeviceId = 'other-device';
  expect(validateHolographicBatchFailureEvidence(tampered)).toBe(false);

  let getterReads = 0;
  const deceptive = { ...evidence };
  Object.defineProperty(deceptive, 'failureFingerprint', {
    enumerable: true,
    get() {
      getterReads += 1;
      return evidence.failureFingerprint;
    },
  });

  expect(validateHolographicBatchFailureEvidence(deceptive)).toBe(false);
  expect(getterReads).toBe(0);
});
