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
  return dispatchHolographicDisplaySession({ session: displaySession, adapter, operation, surfaceType: type });
}

export { OPERATIONS as HOLOGRAPHIC_SURFACE_OPERATIONS };
