/* global describe, expect, test */

import {
  createExecutionLifecycle,
  failExecutionLifecycle,
  rollbackExecutionLifecycle,
  transitionExecutionLifecycle,
} from '../../src/holographic/index.mjs';

describe('holographic execution lifecycle', () => {
  test('tracks deterministic happy-path state history', () => {
    let lifecycle = createExecutionLifecycle({ executionId: 'e1', sceneId: 's1', deviceId: 'd1' });
    lifecycle = transitionExecutionLifecycle(lifecycle, 'validated');
    lifecycle = transitionExecutionLifecycle(lifecycle, 'calibrated');
    lifecycle = transitionExecutionLifecycle(lifecycle, 'executing');
    lifecycle = transitionExecutionLifecycle(lifecycle, 'completed');
    expect(lifecycle.state).toBe('completed');
    expect(lifecycle.history).toEqual(['created', 'validated', 'calibrated', 'executing', 'completed']);
  });

  test('records failure phase and permits explicit rollback', () => {
    let lifecycle = createExecutionLifecycle({ executionId: 'e2', sceneId: 's2', deviceId: 'd2' });
    lifecycle = transitionExecutionLifecycle(lifecycle, 'validated');
    lifecycle = transitionExecutionLifecycle(lifecycle, 'executing');
    lifecycle = failExecutionLifecycle(lifecycle, { phase: 'execution', message: 'adapter timeout' });
    lifecycle = rollbackExecutionLifecycle(lifecycle, 'safe shutdown');
    expect(lifecycle.state).toBe('rolled-back');
    expect(lifecycle.failure.phase).toBe('execution');
    expect(lifecycle.rollback.reason).toBe('safe shutdown');
  });

  test('rejects illegal transitions', () => {
    const lifecycle = createExecutionLifecycle({ executionId: 'e3', sceneId: 's3', deviceId: 'd3' });
    expect(() => transitionExecutionLifecycle(lifecycle, 'completed')).toThrow(/Invalid execution lifecycle transition/);
  });
});
