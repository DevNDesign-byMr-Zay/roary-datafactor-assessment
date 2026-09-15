import { dispatchHolographicDisplaySession } from './display-dispatch.mjs';
import { createDisplaySession } from './display-session.mjs';

const OPERATIONS = Object.freeze({
  holomat: 'mapScene',
  projector: 'render',
  'three-d-platform': 'stage',
});

/** Route a validated renderer-neutral session or scene to a simulated surface operation. */
export async function dispatchHolographicSurface({ session, scene, adapter, operation } = {}) {
  const type = adapter?.device?.type;
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

  return dispatchHolographicDisplaySession({
    session: displaySession,
    adapter,
    operation: selectedOperation,
    surfaceType: canonicalSurfaceType,
  });
}

export { OPERATIONS as HOLOGRAPHIC_SURFACE_OPERATIONS };
