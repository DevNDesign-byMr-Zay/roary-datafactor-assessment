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
    return;
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
}

function preflightAdapters(adapters) {
  if (!Array.isArray(adapters) || adapters.length === 0) {
    throw new TypeError('at least one holographic adapter is required');
  }

  const deviceIds = new Set();
  for (let index = 0; index < adapters.length; index += 1) {
    const adapter = adapters[index];
    const device = adapterDevice(adapter, index);
    const operation = HOLOGRAPHIC_SURFACE_OPERATIONS[device.type];
    if (!operation) {
      throw new TypeError(`unsupported holographic surface: ${device.type}`);
    }
    resolveAdapterOperation(adapter, operation, index);
    if (deviceIds.has(device.id)) {
      throw new TypeError(`duplicate holographic device identity: ${device.id}`);
    }
    deviceIds.add(device.id);
  }
}

export async function dispatchAndSealHolographicSurfaces({ session, adapters } = {}) {
  if (!validateDisplaySession(session)) throw new TypeError('validated display session is required');
  preflightAdapters(adapters);

  const dispatches = [];
  for (const adapter of adapters) {
    dispatches.push(await dispatchHolographicSurface({ session, adapter }));
  }

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
}
