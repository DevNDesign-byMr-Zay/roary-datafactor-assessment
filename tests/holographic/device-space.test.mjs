import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeviceSpaceEvidence, createDeviceSpaceProfile, mapScenePointToDeviceSpace } from '../../src/holographic/device-space.mjs';

test('device-space mapping is deterministic and origin-aware', () => {
  const profile = createDeviceSpaceProfile({ deviceId: 'projector-1', deviceType: 'projector', origin: { x: 1, y: 2, z: 3 }, scale: 2 });
  assert.deepEqual(mapScenePointToDeviceSpace({ x: 2, y: 4, z: 6 }, profile), { x: 2, y: 4, z: 6 });
  assert.deepEqual(mapScenePointToDeviceSpace({ x: 2, y: 4, z: 6 }, profile), mapScenePointToDeviceSpace({ x: 2, y: 4, z: 6 }, profile));
});

test('device-space evidence records source and mapped coordinates', () => {
  const profile = createDeviceSpaceProfile({ deviceId: 'holomat-1', deviceType: 'holomat', scale: 0.5 });
  const evidence = createDeviceSpaceEvidence({ sceneId: 'scene-1', profile, sourcePoint: { x: 4, y: 2, z: -2 } });
  assert.equal(evidence.schema, 'holo.device-space.v1');
  assert.deepEqual(evidence.mappedPoint, { x: 2, y: 1, z: -1 });
});

test('device-space bounds fail closed', () => {
  const profile = createDeviceSpaceProfile({ deviceId: 'platform-1', deviceType: 'three-d-platform', bounds: { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } } });
  assert.throws(() => mapScenePointToDeviceSpace({ x: 2, y: 0, z: 0 }, profile), /outside device bounds/);
});

test('device-space profiles reject invalid scale and inverted bounds', () => {
  assert.throws(() => createDeviceSpaceProfile({ deviceId: 'p', deviceType: 'projector', scale: 0 }), /scale must be positive/);
  assert.throws(() => createDeviceSpaceProfile({ deviceId: 'p', deviceType: 'projector', bounds: { min: { x: 1 }, max: { x: 0 } } }), /bounds min must not exceed max/);
});
