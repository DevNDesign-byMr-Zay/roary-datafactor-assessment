const ACTIONS = new Set(['focus', 'select', 'activate', 'inspect', 'dismiss']);

function text(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} must be a non-empty string.`);
  return value.trim();
}

/**
 * Normalize a user interaction into a renderer-neutral event. Events describe
 * intent only and never invoke hardware or mutate a device.
 */
export function createHolographicInteractionEvent({ sceneId, nodeId, action, source = 'user' } = {}) {
  const normalizedAction = text(action, 'action');
  if (!ACTIONS.has(normalizedAction)) throw new TypeError(`Unsupported holographic action: ${normalizedAction}`);
  return Object.freeze({
    schemaVersion: 1,
    sceneId: text(sceneId, 'sceneId'),
    nodeId: text(nodeId, 'nodeId'),
    action: normalizedAction,
    source: text(source, 'source'),
    advisoryOnly: true,
    physicalActuation: false,
  });
}

/**
 * Resolve an interaction against a scene without mutating the source scene.
 */
export function resolveHolographicInteraction(scene, event) {
  if (!scene || typeof scene !== 'object' || !Array.isArray(scene.nodes)) {
    throw new TypeError('A valid holographic scene is required.');
  }
  const interaction = createHolographicInteractionEvent(event);
  if (interaction.sceneId !== scene.id) throw new TypeError('event.sceneId must match scene.id.');
  const node = scene.nodes.find((candidate) => candidate.id === interaction.nodeId);
  const safety = Object.freeze({ advisoryOnly: true, authoritative: false, physicalActuation: false });
  return Object.freeze({
    handled: Boolean(node),
    action: interaction.action,
    nodeId: interaction.nodeId,
    node: node ?? null,
    advisoryOnly: true,
    physicalActuation: false,
    safety,
  });
}

export { ACTIONS };
