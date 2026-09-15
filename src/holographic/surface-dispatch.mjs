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
  if (operation !== undefined && typeof operation !== 'string') throw new TypeError('holographic surface operation must be a string');
  const selectedOperation = operation ?? defaultOperation;
  return dispatchHolographicDisplaySession({ session, adapter, operation: selectedOperation, surfaceType: type });
}

export { OPERATIONS as HOLOGRAPHIC_SURFACE_OPERATIONS };
