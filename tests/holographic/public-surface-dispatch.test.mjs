import { expect, test } from '@jest/globals';
import {
  createDisplaySession,
  createScene,
  dispatchHolographicSurface,
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
} from '../../src/holographic/index.mjs';

const scene = createScene({ id: 'scene-public-1', nodes: [{ id: 'node-1', type: 'content', transform: { x: 1, y: 2, z: 3 } }] });

test('public surface dispatcher routes supported simulated surfaces', async () => {
  const cases = [
    [new SimulatedHoloMatAdapter({ id: 'mat-1' }), 'mapped'],
    [new SimulatedProjectorAdapter({ id: 'projector-1' }), 'rendered'],
    [new SimulatedThreeDPlatformAdapter({ id: 'platform-1' }), 'staged'],
  ];
  for (const [adapter, status] of cases) {
    const session = createDisplaySession({ scene, sessionId: `session-${adapter.device.id}` });
    const result = await dispatchHolographicSurface({ session, adapter });
    expect(result.result.status).toBe(status);
    expect(result.safety.physicalActuation).toBe(false);
    expect(result.safety.advisoryOnly).toBe(true);
  }
});

test('public surface dispatcher fails closed for unsupported surfaces', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-unsupported' });
  await expect(dispatchHolographicSurface({ session, adapter: { device: { type: 'unknown' } } })).rejects.toThrow(/unsupported holographic surface/);
});
