import { createScene, createTransform, validateSceneForDevice } from './contracts.mjs';

export function planHolographicScene({ intent, assets = [], device }) {
  if (typeof intent !== 'string' || !intent.trim()) throw new TypeError('Intent is required.');
  if (!Array.isArray(assets)) throw new TypeError('Assets must be an array.');
  if (!device) throw new TypeError('A target device is required.');

  const nodes = assets.map((asset, index) => ({
    id: String(asset.id ?? `asset-${index + 1}`),
    type: 'content',
    transform: createTransform({
      x: index * 0.5,
      y: 0,
      z: index * -0.25,
      scale: Number.isFinite(asset.scale) ? asset.scale : 1,
    }),
    data: {
      assetId: asset.id ?? `asset-${index + 1}`,
      source: asset.source ?? 'generated',
      requires: Array.isArray(asset.requires) ? asset.requires : [],
    },
  }));

  const scene = createScene({
    id: `scene-${intent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'default'}`,
    metadata: { intent: intent.trim(), planner: 'roary-holographic-planner-v1' },
    nodes,
  });

  const compatibility = validateSceneForDevice(scene, device);
  if (!compatibility.compatible) {
    const missing = compatibility.missing.join(', ');
    throw new Error(`Target device lacks required holographic capabilities: ${missing}`);
  }

  return Object.freeze({ scene, device: Object.freeze({ ...device }), compatibility });
}
