import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import {
  createDisplaySession,
  createScene,
  dispatchHolographicSurface,
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
} from '../../src/holographic/index.mjs';

const scene = createScene({
  id: 'scene-public-1',
  title: 'Public surface fixture',
  nodes: [{ id: 'node-1', label: 'Grid', transform: { x: 1, y: 2, z: 3 } }],
});

test('public surface dispatcher routes supported simulated surfaces', async () => {
  const cases = [
    [new SimulatedHoloMatAdapter({ id: 'mat-1' }), 'mapScene', 'mapped'],
    [new SimulatedProjectorAdapter({ id: 'projector-1' }), 'render', 'rendered'],
    [new SimulatedThreeDPlatformAdapter({ id: 'platform-1' }), 'stage', 'staged'],
  ];
  for (const [adapter, operation, status] of cases) {
    const result = await dispatchHolographicSurface({ scene, adapter, operation });
    assert.equal(result.result.status, status);
    assert.equal(result.safety.physicalActuation, false);
    assert.equal(result.safety.advisoryOnly, true);
  }
});

test('public surface dispatcher fails closed for renderer-operation identity mismatches', async () => {
  await assert.rejects(
    () => dispatchHolographicSurface({
      scene,
      adapter: new SimulatedProjectorAdapter(),
      operation: 'stage',
    }),
    /surface operation does not match renderer identity: projector requires render/,
  );
});

test('public surface dispatcher rejects ambiguous session and scene sources', async () => {
  const session = createDisplaySession({ scene, sessionId: 'surface-source-session' });
  const shadowScene = createScene({ id: 'shadow-scene', nodes: [] });

  await assert.rejects(
    () => dispatchHolographicSurface({
      session,
      scene: shadowScene,
      adapter: new SimulatedProjectorAdapter(),
    }),
    /either session or scene, not both/,
  );
});

test('public surface dispatcher requires one explicit evidence source', async () => {
  await assert.rejects(
    () => dispatchHolographicSurface({ adapter: new SimulatedProjectorAdapter() }),
    /requires a validated session or scene/,
  );
});
