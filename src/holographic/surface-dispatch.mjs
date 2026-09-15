import { dispatchHolographicDisplaySession } from './display-dispatch.mjs';

const OPERATIONS = Object.freeze({
  holomat: 'mapScene',
  projector: 'render',
  'three-d-platform': 'stage',
});

/** Route a validated renderer-neutral session to a simulated surface operation. */
export async function dispatchHolographicSurface({ session, adapter } = {}) {
  const type = adapter?.device?.type;
  const operation = OPERATIONS[type];
  if (!operation) throw new TypeError(`unsupported holographic surface: ${type ?? 'unknown'}`);
  const displaySession = session?.displaySession ?? session;
  const result = await dispatchHolographicDisplaySession({ session: displaySession, adapter, operation });
  return Object.freeze({ ...result, surfaceType: type === 'holomat' ? 'holo-mat' : type });
}

export { OPERATIONS as HOLOGRAPHIC_SURFACE_OPERATIONS };
