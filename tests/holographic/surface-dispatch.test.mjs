import { expect, test } from '@jest/globals';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchHolographicSurface } from '../../src/holographic/surface-dispatch.mjs';
import { SimulatedHoloMatAdapter, SimulatedProjectorAdapter, SimulatedThreeDPlatformAdapter } from '../../src/holographic/adapters.mjs';

const scene = createScene({ id: 'surface-scene', nodes: [{ id: 'node-1', type: 'content', transform: { x: 1, y: 2, z: 3 } }] });

for (const [name, Adapter, expected] of [
  ['holomat', SimulatedHoloMatAdapter, 'mapScene'],
  ['projector', SimulatedProjectorAdapter, 'render'],
  ['three-d-platform', SimulatedThreeDPlatformAdapter, 'stage'],
]) {
  test(`${name} dispatch selects its renderer operation`, async () => {
    const adapter = new Adapter({ id: `${name}-test` });
    const session = createDisplaySession({ scene, sessionId: `session-${name}` });
    const result = await dispatchHolographicSurface({ session, adapter });
    expect(result.operation).toBe(expected);
    expect(result.surfaceType).toBe(name);
    expect(result.safety.authoritative).toBe(false);
    expect(result.safety.physicalActuation).toBe(false);
  });
}

test('unknown surface types fail closed', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-unknown' });
  await expect(dispatchHolographicSurface({ session, adapter: { device: { type: 'unknown' } } })).rejects.toThrow(/unsupported holographic surface/);
});
