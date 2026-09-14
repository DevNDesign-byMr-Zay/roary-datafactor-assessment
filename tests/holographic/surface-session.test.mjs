import { expect, test } from '@jest/globals';
import { createScene, createCalibrationProfile, createHolographicInteractionEvent, SimulatedHoloMatAdapter } from '../../src/holographic/index.mjs';
import { createHolographicSurfaceSession, dispatchHolographicSurfaceSession } from '../../src/holographic/surface-session.mjs';

const scene = createScene({
  id: 'surface-scene',
  nodes: [{ id: 'node-1', transform: { x: 2, y: 3, z: 4 } }],
});

const calibration = createCalibrationProfile({ width: 100, height: 100, originX: 10, originY: 20, scaleX: 5, scaleY: 4, depthScale: 2 });

test('surface session preserves calibration and advisory interaction state', async () => {
  const event = createHolographicInteractionEvent({ sceneId: scene.id, nodeId: 'node-1', action: 'inspect', source: 'operator' });
  const session = createHolographicSurfaceSession({ scene, calibrationProfile: calibration, events: [event], sessionId: 'session-1' });
  const adapter = new SimulatedHoloMatAdapter({ id: 'mat-1' });
  const result = await dispatchHolographicSurfaceSession({ session, adapter });

  expect(result.result.status).toBe('mapped');
  expect(result.result.sceneId).toBe(scene.id);
  expect(result.calibrated).toBe(true);
  expect(result.safety).toEqual({ authoritative: false, physicalActuation: false, advisoryOnly: true });
  expect(session.displaySession.packet.scene.nodes[0].transform.x).toBe(2);
  expect(session.events[0].action).toBe('inspect');
});

test('surface session fails closed for unsupported adapters', async () => {
  const session = createHolographicSurfaceSession({ scene, sessionId: 'session-2' });
  await expect(dispatchHolographicSurfaceSession({ session, adapter: { device: { type: 'unknown' } } })).rejects.toThrow(/unsupported holographic surface/);
});
