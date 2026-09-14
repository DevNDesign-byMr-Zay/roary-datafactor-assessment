import { describe, expect, test } from '@jest/globals';
import { createScene, createTransform } from '../../src/holographic/index.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchHolographicDisplaySession } from '../../src/holographic/display-dispatch.mjs';
import { SimulatedHoloMatAdapter } from '../../src/holographic/adapters.mjs';

const scene = createScene({
  id: 'scene-1',
  nodes: [{ id: 'node-1', type: 'content', transform: createTransform({ x: 1, y: 2, z: 3 }) }],
});

describe('holographic renderer session safety', () => {
  test('dispatches validated sessions without granting physical authority', async () => {
    const session = createDisplaySession({ scene, sessionId: 'session-1' });
    const adapter = new SimulatedHoloMatAdapter({ id: 'holo-mat-test' });
    const dispatched = await dispatchHolographicDisplaySession({ session, adapter, operation: 'mapScene' });
    expect(dispatched.result.status).toBe('mapped');
    expect(dispatched.safety).toEqual({ authoritative: false, physicalActuation: false, advisoryOnly: true });
  });
});
