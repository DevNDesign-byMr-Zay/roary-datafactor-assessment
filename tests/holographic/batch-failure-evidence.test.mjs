import { expect, it } from '@jest/globals';
import {
  HolographicBatchDispatchError,
  createDisplaySession,
  createHolographicBatchFailureEvidence,
  createScene,
  dispatchAndSealHolographicSurfaces,
  validateHolographicBatchFailureEvidence,
  validateHolographicBatchFailureEvidenceAgainstSession,
} from '../../src/holographic/index.mjs';

function sessionFixture(sessionId = 'failure-evidence-session') {
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
    sessionId,
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
    return { error, session };
  }
  throw new Error('expected holographic batch failure');
}

it('projects typed batch failure into deterministic transport-safe evidence', async () => {
  const { error: failure } = await failureFixture();
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

it('binds transported failure evidence to the exact validated display session', async () => {
  const { error: failure, session } = await failureFixture();
  const evidence = JSON.parse(JSON.stringify(createHolographicBatchFailureEvidence(failure)));
  const otherSession = sessionFixture('other-failure-session');

  expect(validateHolographicBatchFailureEvidenceAgainstSession(evidence, session)).toBe(true);
  expect(validateHolographicBatchFailureEvidenceAgainstSession(evidence, otherSession)).toBe(false);
  expect(validateHolographicBatchFailureEvidenceAgainstSession(evidence, {})).toBe(false);
  expect(
    validateHolographicBatchFailureEvidenceAgainstSession(
      { ...evidence, sessionFingerprint: otherSession.sessionFingerprint },
      otherSession,
    ),
  ).toBe(false);
});

it('rejects transported tampering and deceptive top-level accessors without executing getters', async () => {
  const { error: failure } = await failureFixture();
  const evidence = createHolographicBatchFailureEvidence(failure);
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

it('rejects malformed failure metadata and widened safety after transport', async () => {
  const { error: failure } = await failureFixture();
  const evidence = JSON.parse(JSON.stringify(createHolographicBatchFailureEvidence(failure)));
  const mutations = [
    { version: 2 },
    { phase: 'retry' },
    { sessionFingerprint: 'not-a-fingerprint' },
    { failedIndex: -1 },
    { failedDeviceId: '' },
    { failedDeviceType: '' },
    { failureReason: '' },
    { interpretation: 'sealed-success' },
    { failureFingerprint: 'bad' },
  ];

  for (const mutation of mutations) {
    expect(validateHolographicBatchFailureEvidence({ ...evidence, ...mutation })).toBe(false);
  }

  expect(
    validateHolographicBatchFailureEvidence({
      ...evidence,
      safety: { ...evidence.safety, automaticRetry: true },
    }),
  ).toBe(false);
  expect(
    validateHolographicBatchFailureEvidence({
      ...evidence,
      safety: { ...evidence.safety, sealedSuccess: true },
    }),
  ).toBe(false);
});

it('rejects malformed or decorated partial dispatch evidence', async () => {
  const { error: failure } = await failureFixture();
  const evidence = JSON.parse(JSON.stringify(createHolographicBatchFailureEvidence(failure)));
  const partial = evidence.partialDispatches[0];

  for (const mutation of [
    { dispatchFingerprint: 'bad' },
    { deviceId: '' },
    { deviceType: '' },
    { operation: '' },
    { surfaceType: '' },
  ]) {
    expect(
      validateHolographicBatchFailureEvidence({
        ...evidence,
        partialDispatches: [{ ...partial, ...mutation }],
      }),
    ).toBe(false);
  }

  const decorated = [...evidence.partialDispatches];
  decorated.shadow = true;
  expect(
    validateHolographicBatchFailureEvidence({ ...evidence, partialDispatches: decorated }),
  ).toBe(false);
});

it('requires the existing typed batch error before projecting transport evidence', () => {
  expect(() => createHolographicBatchFailureEvidence(new Error('untyped'))).toThrow(
    /typed holographic batch failure/,
  );
});
