import { describe, expect, it } from '@jest/globals';
import { createHolographicScenePacket, validateHolographicScenePacket } from '../../src/holographic/scene-packet.mjs';

describe('holographic scene packets', () => {
  const scene = { id: 'scene-001', version: 1, nodes: [{ id: 'node-1', type: 'content', transform: { x: 1, y: 2, z: 3 }, data: { requires: ['depth'] } }] };

  it('creates a deterministic, advisory-only packet', () => {
    const event = { sceneId: 'scene-001', nodeId: 'node-1', action: 'inspect', source: 'operator' };
    const packet = createHolographicScenePacket({ scene, calibrationProfile: { width: 1920, height: 1080 }, interactionEvents: [event] });
    expect(validateHolographicScenePacket(packet)).toBe(true);
    expect(packet.interactionEvents[0]).toMatchObject({ advisoryOnly: true, physicalActuation: false });
  });

  it('detects packet tampering', () => {
    const packet = createHolographicScenePacket({ scene });
    const tampered = { ...packet, scene: { ...packet.scene, id: 'scene-tampered' } };
    expect(validateHolographicScenePacket(tampered)).toBe(false);
  });

  it('rejects malformed interaction collections', () => {
    expect(() => createHolographicScenePacket({ scene, interactionEvents: {} })).toThrow();
  });

  it('rejects malformed calibration profiles at creation and validation boundaries', () => {
    expect(() => createHolographicScenePacket({ scene, calibrationProfile: { width: 0, height: 1080 } })).toThrow('width must be greater than zero');

    const packet = createHolographicScenePacket({ scene });
    const tampered = {
      ...packet,
      calibrationProfile: { width: 1920, height: 1080, scaleX: -1 },
    };
    expect(validateHolographicScenePacket(tampered)).toBe(false);
  });
});
