import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchHolographicSurface } from '../../src/holographic/surface-dispatch.mjs';
import { SimulatedHoloMatAdapter, SimulatedProjectorAdapter, SimulatedThreeDPlatformAdapter } from '../../src/holographic/adapters.mjs';

const scene = createScene({ id: 'surface-scene', nodes: [{ id: 'node-1', label: 'Grid', transform: { x: 1, y: 2, z: 3 } }] });

for (const [name, Adapter, expected] of [
  ['holo-mat', SimulatedHoloMatAdapter, 'mapScene'],
  ['projector', SimulatedProjectorAdapter, 'render'],
  ['three-d-platform', SimulatedThreeDPlatformAdapter, 'stage'],
]) {
  test(`${name} dispatch selects its renderer operation`, async () => {
    const adapter = new Adapter({ id: `${name}-test` });
    const session = createDisplaySession({ scene, sessionId: `session-${name}` });
    const result = await dispatchHolographicSurface({ session, adapter });
    assert.equal(result.operation, expected);
    assert.equal(result.surfaceType, name);
    assert.equal(result.safety.authoritative, false);
    assert.equal(result.safety.physicalActuation, false);
  });
}

test('unknown surface types fail closed', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-unknown' });
  await assert.rejects(() => dispatchHolographicSurface({ session, adapter: { device: { type: 'unknown' } } }), /unsupported holographic surface/);
});
