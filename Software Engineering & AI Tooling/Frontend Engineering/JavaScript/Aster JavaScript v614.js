export function createFrameCoalescer(render, {
  requestFrame = (callback) => requestAnimationFrame(callback),
} = {}) {
  if (typeof render !== 'function') throw new TypeError('render must be a function.');
  if (typeof requestFrame !== 'function') throw new TypeError('requestFrame must be a function.');

  let framePending = false;
  let dirty = false;
  let latestValue;

  const flush = () => {
    framePending = false;
    if (!dirty) return;
    dirty = false;
    const value = latestValue;
    render(value);
    if (dirty && !framePending) {
      framePending = true;
      requestFrame(flush);
    }
  };

  return function schedule(value) {
    latestValue = value;
    dirty = true;
    if (framePending) return;
    framePending = true;
    requestFrame(flush);
  };
}
