import { describe, expect, it } from '@jest/globals';
import {
  createHolographicScenePacket,
  validateHolographicScenePacket,
} from '../../src/holographic/scene-packet.mjs';

describe('holographic scene packets', () => {
  const scene = {
    id: 'scene-001',
    version: 1,
    nodes: [
      {
        id: 'node-1',
        type: 'content',
        transform: { x: 1, y: 2, z: 3 },
        data: { requires: ['depth'] },
      },
    ],
  };

  it('creates a deterministic, advisory-only packet', () => {
    const event = {
      sceneId: 'scene-001',
      nodeId: 'node-1',
      action: 'inspect',
      source: 'operator',
    };
    const packet = createHolographicScenePacket({
      scene,
      calibrationProfile: { width: 1920, height: 1080 },
      interactionEvents: [event],
    });

    expect(validateHolographicScenePacket(packet)).toBe(true);
    expect(packet.interactionEvents[0]).toMatchObject({
      advisoryOnly: true,
      physicalActuation: false,
    });
    expect(packet.fingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('deep-freezes nested packet evidence after capture', () => {
    const packet = createHolographicScenePacket({
      scene,
      calibrationProfile: { viewport: { width: 1920, height: 1080 } },
      interactionEvents: [{ action: 'inspect', details: { mode: 'read-only' } }],
    });

    expect(Object.isFrozen(packet)).toBe(true);
    expect(Object.isFrozen(packet.scene.nodes)).toBe(true);
    expect(Object.isFrozen(packet.scene.nodes[0].data)).toBe(true);
    expect(Object.isFrozen(packet.scene.nodes[0].data.requires)).toBe(true);
    expect(Object.isFrozen(packet.calibrationProfile.viewport)).toBe(true);
    expect(Object.isFrozen(packet.interactionEvents)).toBe(true);
    expect(Object.isFrozen(packet.interactionEvents[0].details)).toBe(true);
  });

  it('detects packet tampering and non-canonical scene fields', () => {
    const packet = createHolographicScenePacket({ scene });
    const tampered = { ...packet, scene: { ...packet.scene, id: 'scene-tampered' } };
    const widened = { ...packet, scene: { ...packet.scene, hiddenAuthority: true } };

    expect(validateHolographicScenePacket(tampered)).toBe(false);
    expect(validateHolographicScenePacket(widened)).toBe(false);
  });

  it('rejects malformed interaction collections', () => {
    expect(() => createHolographicScenePacket({ scene, interactionEvents: {} })).toThrow();
  });

  it('rejects accessor-backed constructor input without evaluating getters', () => {
    let getterReads = 0;
    const input = {};
    Object.defineProperty(input, 'scene', {
      enumerable: true,
      get() {
        getterReads += 1;
        return scene;
      },
    });

    expect(() => createHolographicScenePacket(input)).toThrow(/must not use accessors/);
    expect(getterReads).toBe(0);
  });

  it('rejects prototype-backed and symbol-bearing evidence', () => {
    const prototypeBacked = Object.create({ inherited: true });
    prototypeBacked.scene = scene;
    expect(() => createHolographicScenePacket(prototypeBacked)).toThrow(/plain objects/);

    const event = { action: 'inspect' };
    event[Symbol('hidden')] = 'not-evidence';
    expect(() => createHolographicScenePacket({ scene, interactionEvents: [event] })).toThrow(
      /symbol properties/,
    );
  });

  it('rejects execution authority hidden inside interaction evidence', () => {
    for (const field of [
      'authoritative',
      'actuatesHardware',
      'physicalActuation',
      'autoApply',
      'dispatchesInfrastructure',
      'deploysInfrastructure',
    ]) {
      expect(() =>
        createHolographicScenePacket({
          scene,
          interactionEvents: [{ action: 'inspect', [field]: true }],
        }),
      ).toThrow(/must not grant execution authority/);
    }
  });

  it('rejects accessor-backed packets during validation without evaluating getters', () => {
    const packet = createHolographicScenePacket({ scene });
    let getterReads = 0;
    const deceptive = { ...packet };
    Object.defineProperty(deceptive, 'scene', {
      enumerable: true,
      configurable: true,
      get() {
        getterReads += 1;
        return packet.scene;
      },
    });

    expect(validateHolographicScenePacket(deceptive)).toBe(false);
    expect(getterReads).toBe(0);
  });

  it('rejects unsupported packet fields even when the fingerprint is otherwise valid', () => {
    const packet = createHolographicScenePacket({ scene });
    expect(validateHolographicScenePacket({ ...packet, extra: 'smuggled' })).toBe(false);
  });
});
