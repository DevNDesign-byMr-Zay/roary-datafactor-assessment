import { dispatchHolographicDisplaySession } from './display-dispatch.mjs';
import { createDisplaySession } from './display-session.mjs';

const OPERATIONS = Object.freeze({
  holomat: 'mapScene',
  projector: 'render',
  'three-d-platform': 'stage',
});

function readSceneIdentity(scene) {
  if (!scene || typeof scene !== 'object' || Array.isArray(scene)) {
    throw new TypeError('scene must be an object for surface dispatch');
  }
  const idDescriptor = Object.getOwnPropertyDescriptor(scene, 'id');
  if (idDescriptor) {
    if ('get' in idDescriptor || 'set' in idDescriptor) {
      throw new TypeError('scene.id must not use accessors');
    }
    if (typeof idDescriptor.value === 'string' && idDescriptor.value.trim()) {
      return idDescriptor.value.trim();
    }
  }

  const sceneIdDescriptor = Object.getOwnPropertyDescriptor(scene, 'sceneId');
  if (sceneIdDescriptor) {
    if ('get' in sceneIdDescriptor || 'set' in sceneIdDescriptor) {
      throw new TypeError('scene.sceneId must not use accessors');
    }
    if (typeof sceneIdDescriptor.value === 'string' && sceneIdDescriptor.value.trim()) {
      return sceneIdDescriptor.value.trim();
    }
  }

  throw new TypeError('scene identity is required for surface dispatch');
}

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

/** Route one validated renderer-neutral session or scene to its typed simulated surface operation. */
export async function dispatchHolographicSurface({ session, scene, adapter, operation } = {}) {
  if (session && scene) {
    throw new TypeError('surface dispatch requires either session or scene, not both');
  }

  const type = readAdapterSurfaceType(adapter);
  const defaultOperation = OPERATIONS[type];
  if (!defaultOperation) throw new TypeError(`unsupported holographic surface: ${type ?? 'unknown'}`);
  const selectedOperation = operation ?? defaultOperation;
  if (selectedOperation !== defaultOperation) {
    throw new TypeError(
      `surface operation does not match renderer identity: ${type} requires ${defaultOperation}`,
    );
  }

  const canonicalSurfaceType = type === 'holomat' ? 'holo-mat' : type;

  let displaySession = session?.displaySession ?? session;
  if (!displaySession && scene) {
    const sceneId = readSceneIdentity(scene);
    displaySession = createDisplaySession({
      scene,
      sessionId: `surface:${sceneId}`,
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
