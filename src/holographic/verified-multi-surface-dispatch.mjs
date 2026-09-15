import { createDeviceDescriptor } from './contracts.mjs';
import { validateDisplaySession } from './display-session.mjs';
import {
  dispatchHolographicSurface,
  HOLOGRAPHIC_SURFACE_OPERATIONS,
} from './surface-dispatch.mjs';
import {
  createHolographicDispatchBatchReceipt,
  validateHolographicDispatchBatchReceipt,
} from './dispatch-batch-receipt.mjs';

function adapterDevice(adapter, index) {
  if (!adapter || typeof adapter !== 'object') {
    throw new TypeError(`adapter ${index} must be an object`);
  }
  const descriptor = Object.getOwnPropertyDescriptor(adapter, 'device');
  if (!descriptor || 'get' in descriptor || 'set' in descriptor) {
    throw new TypeError(`adapter ${index} requires a plain device descriptor`);
  }
  return createDeviceDescriptor(descriptor.value);
}

function resolveAdapterOperation(adapter, operation, index) {
  const ownDescriptor = Object.getOwnPropertyDescriptor(adapter, operation);
  if (ownDescriptor) {
    if ('get' in ownDescriptor || 'set' in ownDescriptor || typeof ownDescriptor.value !== 'function') {
      throw new TypeError(`adapter ${index} operation not supported: ${operation}`);
    }
    return ownDescriptor.value;
  }

  const prototype = Object.getPrototypeOf(adapter);
  if (!prototype || prototype === Object.prototype || prototype.constructor === Object) {
    throw new TypeError(`adapter ${index} operation not supported: ${operation}`);
  }
  const prototypeDescriptor = Object.getOwnPropertyDescriptor(prototype, operation);
  if (
    !prototypeDescriptor ||
    'get' in prototypeDescriptor ||
    'set' in prototypeDescriptor ||
    typeof prototypeDescriptor.value !== 'function'
  ) {
    throw new TypeError(`adapter ${index} operation not supported: ${operation}`);
  }
  return prototypeDescriptor.value;
}

function sameDevice(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function preflightAdapters(adapters) {
  if (!Array.isArray(adapters) || adapters.length === 0) {
    throw new TypeError('at least one holographic adapter is required');
  }

  const deviceIds = new Set();
  const plans = [];
  for (let index = 0; index < adapters.length; index += 1) {
    const adapter = adapters[index];
    const device = adapterDevice(adapter, index);
    const operation = HOLOGRAPHIC_SURFACE_OPERATIONS[device.type];
    if (!operation) {
      throw new TypeError(`unsupported holographic surface: ${device.type}`);
    }
    const operationFn = resolveAdapterOperation(adapter, operation, index);
    if (deviceIds.has(device.id)) {
      throw new TypeError(`duplicate holographic device identity: ${device.id}`);
    }
    deviceIds.add(device.id);
    plans.push(Object.freeze({ adapter, device, operation, operationFn }));
  }
  return Object.freeze(plans);
}

function assertAdapterPlanCurrent(plan, index) {
  const currentDevice = adapterDevice(plan.adapter, index);
  const currentOperation = HOLOGRAPHIC_SURFACE_OPERATIONS[currentDevice.type];
  if (
    !sameDevice(currentDevice, plan.device) ||
    currentOperation !== plan.operation ||
    resolveAdapterOperation(plan.adapter, plan.operation, index) !== plan.operationFn
  ) {
    throw new TypeError(`adapter ${index} changed after batch preflight`);
  }
}

function partialDispatchSummary(dispatch) {
  return Object.freeze({
    dispatchFingerprint: dispatch.dispatchFingerprint,
    deviceId: dispatch.adapterDevice?.id ?? null,
    deviceType: dispatch.adapterDevice?.type ?? null,
    operation: dispatch.operation,
    surfaceType: dispatch.surfaceType ?? null,
  });
}

function safeFailureReason(cause) {
  if (!(cause instanceof Error)) return 'unknown holographic batch failure';
  const messageDescriptor = Object.getOwnPropertyDescriptor(cause, 'message');
  if (
    !messageDescriptor ||
    'get' in messageDescriptor ||
    'set' in messageDescriptor ||
    typeof messageDescriptor.value !== 'string' ||
    messageDescriptor.value.length === 0
  ) {
    return 'holographic renderer failure';
  }
  return messageDescriptor.value;
}

export class HolographicBatchDispatchError extends Error {
  constructor({ session, phase, failedIndex, failedDevice, dispatches, cause }) {
    const reason = safeFailureReason(cause);
    super(`holographic batch ${phase} failed: ${reason}`);
    this.name = 'HolographicBatchDispatchError';
    this.phase = phase;
    this.sessionFingerprint = session.sessionFingerprint;
    this.failedIndex = failedIndex;
    this.failedDeviceId = failedDevice?.id ?? null;
    this.failedDeviceType = failedDevice?.type ?? null;
    this.failureReason = reason;
    this.partialDispatches = Object.freeze(dispatches.map(partialDispatchSummary));
    Object.freeze(this);
  }
}

function batchFailure({ session, phase, failedIndex, plan, dispatches, cause }) {
  return new HolographicBatchDispatchError({
    session,
    phase,
    failedIndex,
    failedDevice: plan?.device ?? null,
    dispatches,
    cause,
  });
}

export async function dispatchAndSealHolographicSurfaces({ session, adapters } = {}) {
  if (!validateDisplaySession(session)) throw new TypeError('validated display session is required');
  const plans = preflightAdapters(adapters);

  const dispatches = [];
  for (let index = 0; index < plans.length; index += 1) {
    const plan = plans[index];
    try {
      assertAdapterPlanCurrent(plan, index);
      const dispatch = await dispatchHolographicSurface({
        session,
        adapter: plan.adapter,
        operation: plan.operation,
      });
      dispatches.push(dispatch);
      assertAdapterPlanCurrent(plan, index);
    } catch (cause) {
      throw batchFailure({
        session,
        phase: 'dispatch',
        failedIndex: index,
        plan,
        dispatches,
        cause,
      });
    }
  }

  for (let index = 0; index < plans.length; index += 1) {
    try {
      assertAdapterPlanCurrent(plans[index], index);
    } catch (cause) {
      throw batchFailure({
        session,
        phase: 'seal',
        failedIndex: index,
        plan: plans[index],
        dispatches,
        cause,
      });
    }
  }

  try {
    const receipt = createHolographicDispatchBatchReceipt({ session, dispatches, adapters });
    if (!validateHolographicDispatchBatchReceipt(receipt, { session, dispatches, adapters })) {
      throw new TypeError('sealed holographic dispatch batch failed validation');
    }

    return Object.freeze({
      sessionFingerprint: session.sessionFingerprint,
      dispatches: Object.freeze([...dispatches]),
      receipt,
      verification: 'dispatch-batch-sealed-before-return',
    });
  } catch (cause) {
    throw batchFailure({
      session,
      phase: 'seal',
      failedIndex: null,
      plan: null,
      dispatches,
      cause,
    });
  }
}
