import { createDeviceDescriptor } from './contracts.mjs';
import { validateDisplaySession } from './display-session.mjs';
import { dispatchHolographicSurface } from './surface-dispatch.mjs';
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

function preflightAdapters(adapters) {
  if (!Array.isArray(adapters) || adapters.length === 0) {
    throw new TypeError('at least one holographic adapter is required');
  }

  const deviceIds = new Set();
  for (let index = 0; index < adapters.length; index += 1) {
    const device = adapterDevice(adapters[index], index);
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
