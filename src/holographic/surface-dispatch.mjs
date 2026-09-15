import { dispatchHolographicDisplaySession } from './display-dispatch.mjs';
import { createDisplaySession } from './display-session.mjs';

const OPERATIONS = Object.freeze({
  holomat: 'mapScene',
  projector: 'render',
  'three-d-platform': 'stage',
});

function readAdapterSurfaceType(adapter) {
  if (!adapter || typeof adapter !== 'object') return null;
  const deviceDescriptor = Object.getOwnPropertyDescriptor(adapter, 'device');
  if (!deviceDescriptor) return null;
  if ('get' in deviceDescriptor || 'set' in deviceDescriptor) {
    throw new TypeError('adapter.device must not use accessors');
  }
  const device = deviceDescriptor.value;
  if (!device || typeof device !== 'object' || Array.isArray(device)) return null;
  const typeDescriptor = Object.getOwnPropertyDescriptor(device, 'type');
  if (!typeDescriptor) return null;
  if ('get' in typeDescriptor || 'set' in typeDescriptor) {
    throw new TypeError('adapter.device.type must not use accessors');
  }
  return typeof typeDescriptor.value === 'string' ? typeDescriptor.value : null;
}

/** Route one validated renderer-neutral session or scene to a simulated surface operation. */
export async function dispatchHolographicSurface({ session, scene, adapter, operation } = {}) {
  if (session && scene) {
    throw new TypeError('surface dispatch requires either session or scene, not both');
  }

  const type = readAdapterSurfaceType(adapter);
  const defaultOperation = OPERATIONS[type];
  if (!defaultOperation) throw new TypeError(`unsupported holographic surface: ${type ?? 'unknown'}`);
  const selectedOperation = operation ?? defaultOperation;
  const canonicalSurfaceType = type === 'holomat' ? 'holo-mat' : type;

  let displaySession = session?.displaySession ?? session;
  if (!displaySession && scene) {
    const sceneId = scene.id ?? scene.sceneId;
    if (typeof sceneId !== 'string' || !sceneId.trim()) {
      throw new TypeError('scene identity is required for surface dispatch');
    }
    displaySession = createDisplaySession({
      scene,
      sessionId: `surface:${sceneId.trim()}`,
    });
  }

  if (!displaySession) {
    throw new TypeError('surface dispatch requires a validated session or scene');
  }

  return dispatchHolographicDisplaySession({
    session: displaySession,
    adapter,
    operation: selectedOperation,
    surfaceType: canonicalSurfaceType,
  });
}

export { OPERATIONS as HOLOGRAPHIC_SURFACE_OPERATIONS };
