import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createScene } from '../../src/holographic/contracts.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchHolographicSurface } from '../../src/holographic/surface-dispatch.mjs';
import {
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
} from '../../src/holographic/adapters.mjs';

const scene = createScene({
  id: 'surface-scene',
  nodes: [{ id: 'node-1', label: 'Grid', transform: { x: 1, y: 2, z: 3 } }],
});

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
  await assert.rejects(
    () => dispatchHolographicSurface({ session, adapter: { device: { type: 'unknown' } } }),
    /unsupported holographic surface/,
  );
});

test('surface routing rejects operation identity swaps', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-operation-swap' });
  const adapter = new SimulatedHoloMatAdapter({ id: 'holomat-swap' });

  await assert.rejects(
    () => dispatchHolographicSurface({ session, adapter, operation: 'render' }),
    /surface operation does not match renderer identity: holomat requires mapScene/,
  );
});

test('surface routing rejects accessor-backed adapter devices without evaluating getters', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-device-accessor' });
  let getterReads = 0;
  const adapter = {};
  Object.defineProperty(adapter, 'device', {
    enumerable: true,
    get() {
      getterReads += 1;
      return { type: 'holomat' };
    },
  });

  await assert.rejects(
    () => dispatchHolographicSurface({ session, adapter }),
    /adapter\.device must not use accessors/,
  );
  assert.equal(getterReads, 0);
});

test('surface routing rejects accessor-backed device types without evaluating getters', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-type-accessor' });
  let getterReads = 0;
  const device = {};
  Object.defineProperty(device, 'type', {
    enumerable: true,
    get() {
      getterReads += 1;
      return 'holomat';
    },
  });
  const adapter = { device };

  await assert.rejects(
    () => dispatchHolographicSurface({ session, adapter }),
    /adapter\.device\.type must not use accessors/,
  );
  assert.equal(getterReads, 0);
});

test('surface routing requires device identity to be own data', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-inherited-device' });
  const adapter = Object.create({ device: { type: 'holomat' } });

  await assert.rejects(
    () => dispatchHolographicSurface({ session, adapter }),
    /unsupported holographic surface: unknown/,
  );
});


test('surface routing rejects accessor-backed scene identity without evaluating getters', async () => {
  const session = createDisplaySession({ scene, sessionId: 'session-scene-id-accessor' });
  let getterReads = 0;
  const deceptiveScene = { ...scene };
  Object.defineProperty(deceptiveScene, 'id', {
    enumerable: true,
    get() {
      getterReads += 1;
      return scene.id;
    },
  });

  await assert.rejects(
    () => dispatchHolographicSurface({
      scene: deceptiveScene,
      adapter: new SimulatedHoloMatAdapter({ id: 'scene-id-accessor' }),
    }),
    /scene\.id must not use accessors/,
  );
  assert.equal(getterReads, 0);
  assert.equal(session.sessionId, 'session-scene-id-accessor');
});

test('surface routing rejects inherited scene identity', async () => {
  const inheritedScene = Object.create({ id: scene.id });
  Object.assign(inheritedScene, scene);
  delete inheritedScene.id;

  await assert.rejects(
    () => dispatchHolographicSurface({
      scene: inheritedScene,
      adapter: new SimulatedHoloMatAdapter({ id: 'inherited-scene-id' }),
    }),
    /scene identity is required for surface dispatch/,
  );
});
