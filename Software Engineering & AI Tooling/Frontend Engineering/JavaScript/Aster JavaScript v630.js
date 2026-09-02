/**
 * Put a file input into an inert state so it cannot be reached by pointer or
 * keyboard interaction while still remaining available for an authorized
 * programmatic activation path.
 */
export function lockFileInput(input) {
  if (!input) return false;

  input.disabled = true;
  input.tabIndex = -1;

  if (input.style) {
    input.style.display = 'block';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.top = '-9999px';
    input.style.width = '1px';
    input.style.height = '1px';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
  }

  return true;
}

/**
 * Create an exclusive activation gate for file inputs.
 *
 * Every tracked input starts locked. activateOnce temporarily unlocks exactly
 * one tracked input, invokes the injected activation function, then schedules
 * all tracked inputs to be locked again on the next turn.
 */
export function createExclusiveFileInputGate({
  inputs,
  activate = (input) => input.click(),
  schedule = (callback) => setTimeout(callback, 0),
} = {}) {
  if (typeof activate !== 'function') throw new TypeError('activate must be a function');
  if (typeof schedule !== 'function') throw new TypeError('schedule must be a function');

  const tracked = Array.from(inputs ?? []).filter(Boolean);
  const trackedSet = new Set(tracked);
  let connected = true;

  const lockAll = () => {
    for (const input of tracked) lockFileInput(input);
  };

  const activateOnce = (input) => {
    if (!connected) return false;
    if (!trackedSet.has(input)) throw new TypeError('input is not managed by this gate');

    lockAll();

    try {
      input.disabled = false;
      if (input.style) input.style.pointerEvents = 'auto';
      activate(input);
      return true;
    } finally {
      try {
        schedule(() => {
          if (connected) lockAll();
        });
      } catch (error) {
        lockAll();
        throw error;
      }
    }
  };

  lockAll();

  return {
    inputs: [...tracked],
    lockAll,
    activateOnce,
    disconnect() {
      if (!connected) return;
      connected = false;
      lockAll();
    },
    isConnected() {
      return connected;
    },
  };
}
