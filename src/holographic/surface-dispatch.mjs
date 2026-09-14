import {
  dispatchHolographicDisplaySession,
  fingerprintHolographicDispatch,
} from './display-dispatch.mjs';

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
  const result = await dispatchHolographicDisplaySession({ session, adapter, operation });
  const surfaceDispatch = { ...result, surfaceType: type };
  return Object.freeze({
    ...surfaceDispatch,
    dispatchFingerprint: fingerprintHolographicDispatch(surfaceDispatch),
  });
}

export { OPERATIONS as HOLOGRAPHIC_SURFACE_OPERATIONS };
