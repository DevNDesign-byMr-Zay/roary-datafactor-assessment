import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { createScene, createCalibrationProfile, createHolographicInteractionEvent, SimulatedHoloMatAdapter } from '../../src/holographic/index.mjs';
import { createHolographicSurfaceSession, dispatchHolographicSurfaceSession } from '../../src/holographic/surface-session.mjs';

const scene = createScene({
  id: 'surface-scene',
  snapshotId: 'snapshot-1',
  coordinateSystem: 'logical-3d',
  nodes: [{ id: 'node-1', transform: { x: 2, y: 3, z: 4 } }],
});

const calibration = createCalibrationProfile({ width: 100, height: 100, originX: 10, originY: 20, scaleX: 5, scaleY: 4, depthScale: 2 });

test('surface session preserves calibration and advisory interaction state', async () => {
  const event = createHolographicInteractionEvent({ sceneId: scene.id, nodeId: 'node-1', action: 'inspect', source: 'operator' });
  const session = createHolographicSurfaceSession({ scene, calibrationProfile: calibration, events: [event], sessionId: 'session-1' });
  const adapter = new SimulatedHoloMatAdapter({ id: 'mat-1' });
  const result = await dispatchHolographicSurfaceSession({ session, adapter });

  assert.equal(result.result.status, 'mapped');
  assert.equal(result.result.sceneId, scene.id);
  assert.equal(result.calibrated, true);
  assert.deepEqual(result.safety, { authoritative: false, physicalActuation: false, advisoryOnly: true });
  assert.equal(session.displaySession.packet.scene.nodes[0].transform.x, 2);
  assert.equal(session.events[0].action, 'inspect');
});

test('surface session fails closed for unsupported adapters', async () => {
  const session = createHolographicSurfaceSession({ scene, sessionId: 'session-2' });
  await assert.rejects(() => dispatchHolographicSurfaceSession({ session, adapter: { device: { type: 'unknown' } } }), /unsupported holographic surface/);
});
