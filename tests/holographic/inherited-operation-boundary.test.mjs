import { expect, test } from '@jest/globals';
import {
  createScene,
  createHolographicSurfaceSession,
  dispatchHolographicSurfaceSession,
} from '../../src/holographic/index.mjs';

test('surface dispatch refuses inherited adapter operations', async () => {
  const scene = createScene({ id: 'dispatch-inherited-operation-scene', nodes: [] });
  const session = createHolographicSurfaceSession({
    scene,
    sessionId: 'dispatch-inherited-operation-session',
  });
  const adapter = Object.create({ mapScene: () => ({ forged: true }) });
  adapter.device = { type: 'holomat' };

  await expect(dispatchHolographicSurfaceSession({ session, adapter })).rejects.toThrow(
    /adapter operation not supported: mapScene/,
  );
});
