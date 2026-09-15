import { dispatchHolographicDisplaySession } from './display-dispatch.mjs';

const OPERATIONS = Object.freeze({
  holomat: 'mapScene',
  projector: 'render',
  'three-d-platform': 'stage',
});

/** Route a validated renderer-neutral session to a simulated surface operation. */
export async function dispatchHolographicSurface({ session, adapter, operation } = {}) {
  const type = adapter?.device?.type;
  const defaultOperation = OPERATIONS[type];
  if (!defaultOperation) throw new TypeError(`unsupported holographic surface: ${type ?? 'unknown'}`);
  const selectedOperation = operation ?? defaultOperation;
  const result = await dispatchHolographicDisplaySession({ session, adapter, operation: selectedOperation });
  return Object.freeze({ ...result, surfaceType: type });
}

export { OPERATIONS as HOLOGRAPHIC_SURFACE_OPERATIONS };
