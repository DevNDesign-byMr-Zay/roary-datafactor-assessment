import assert from 'node:assert/strict';
import {
  SimulatedHoloMatAdapter,
  SimulatedProjectorAdapter,
  SimulatedThreeDPlatformAdapter,
} from '../../src/holographic/adapters.mjs';

for (const [name, Adapter, expectedType] of [
  ['holomat', SimulatedHoloMatAdapter, 'holomat'],
  ['projector', SimulatedProjectorAdapter, 'projector'],
  ['three-d-platform', SimulatedThreeDPlatformAdapter, 'three-d-platform'],
]) {
  test(`${name} adapter preserves its class-bound device identity`, () => {
    const adapter = new Adapter({
      id: `${name}-identity`,
      type: 'projector',
      simulated: false,
      capabilities: ['topology'],
    });
    assert.equal(adapter.device.type, expectedType);
    assert.equal(adapter.device.simulated, true);
    assert.deepEqual(adapter.device.capabilities, ['topology']);
  });
}
