export const EXECUTION_LIFECYCLE_SCHEMA = 'holo.execution-lifecycle.v1';

const TRANSITIONS = Object.freeze({
  created: Object.freeze(['validated', 'failed']),
  validated: Object.freeze(['calibrated', 'executing', 'failed']),
  calibrated: Object.freeze(['executing', 'failed']),
  executing: Object.freeze(['completed', 'rolled-back', 'failed']),
  completed: Object.freeze([]),
  'rolled-back': Object.freeze([]),
  failed: Object.freeze(['rolled-back']),
});

export function createExecutionLifecycle({ executionId, sceneId, deviceId } = {}) {
  for (const [name, value] of Object.entries({ executionId, sceneId, deviceId })) {
    if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  }
  return Object.freeze({
    schema: EXECUTION_LIFECYCLE_SCHEMA,
    executionId: executionId.trim(),
    sceneId: sceneId.trim(),
    deviceId: deviceId.trim(),
    state: 'created',
    history: Object.freeze(['created']),
  });
}

export function transitionExecutionLifecycle(lifecycle, nextState) {
  if (!lifecycle || lifecycle.schema !== EXECUTION_LIFECYCLE_SCHEMA) throw new TypeError('A valid execution lifecycle is required');
  if (!TRANSITIONS[lifecycle.state]?.includes(nextState)) {
    throw new Error(`Invalid execution lifecycle transition: ${lifecycle.state} -> ${nextState}`);
  }
  return Object.freeze({
    ...lifecycle,
    state: nextState,
    history: Object.freeze([...lifecycle.history, nextState]),
  });
}

export function failExecutionLifecycle(lifecycle, { phase, message } = {}) {
  if (typeof phase !== 'string' || !phase.trim()) throw new TypeError('failure phase is required');
  if (typeof message !== 'string' || !message.trim()) throw new TypeError('failure message is required');
  const failed = lifecycle.state === 'failed' ? lifecycle : transitionExecutionLifecycle(lifecycle, 'failed');
  return Object.freeze({ ...failed, failure: Object.freeze({ phase: phase.trim(), message: message.trim() }) });
}

export function rollbackExecutionLifecycle(lifecycle, reason = 'operator-requested rollback') {
  if (typeof reason !== 'string' || !reason.trim()) throw new TypeError('rollback reason is required');
  const rolledBack = transitionExecutionLifecycle(lifecycle, 'rolled-back');
  return Object.freeze({ ...rolledBack, rollback: Object.freeze({ reason: reason.trim() }) });
}
