import { describe, expect, it } from 'vitest';
import { createScene, createTransform } from '../../src/holographic/index.mjs';
import { createDisplaySession } from '../../src/holographic/display-session.mjs';
import { dispatchHolographicDisplaySession } from '../../src/holographic/display-dispatch.mjs';

const scene = createScene({
  id: 'scene-1',
  name: 'Renderer safety fixture',
  nodes: [{ id: 'node-1', label: 'Node', transform: createTransform({ x: 1, y: 2, z: 3 }) }],
});

describe('holographic renderer session safety', () => {
  it('dispatches validated sessions without granting physical authority', () => {
    const session = createDisplaySession({ scene, sessionId: 'session-1' });
    const dispatched = dispatchHolographicDisplaySession({ session, target: 'holo-mat' });
    expect(dispatched.target).toBe('holo-mat');
    expect(dispatched.safety).toEqual({ authoritative: false, physicalActuation: false, advisoryOnly: true });
  });
});
