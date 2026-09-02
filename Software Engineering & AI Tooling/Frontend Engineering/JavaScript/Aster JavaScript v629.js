/**
 * Install a native-first activation fallback for controls whose browser-generated
 * click can be swallowed by unrelated pointer handlers.
 *
 * The fallback waits until the native click window has passed. If no click was
 * observed since pointerup, it invokes the injected activation function once.
 */
export function installMissingActivationFallback({
  element,
  activate = (target) => target.click(),
  schedule = (callback) => setTimeout(callback, 0),
  isEligiblePointer = (event) => event?.isPrimary !== false && (event?.button ?? 0) === 0,
} = {}) {
  if (!element?.addEventListener) throw new TypeError("element is required");
  if (typeof activate !== "function") throw new TypeError("activate must be a function");
  if (typeof schedule !== "function") throw new TypeError("schedule must be a function");
  if (typeof isEligiblePointer !== "function") {
    throw new TypeError("isEligiblePointer must be a function");
  }

  let clickVersion = 0;
  let connected = true;

  const onClick = () => {
    clickVersion += 1;
  };

  const onPointerUp = (event) => {
    if (!isEligiblePointer(event)) return;
    const versionAtPointerUp = clickVersion;

    schedule(() => {
      if (!connected || clickVersion !== versionAtPointerUp) return;
      activate(element, event);
    });
  };

  element.addEventListener("click", onClick, true);
  element.addEventListener("pointerup", onPointerUp, true);

  return {
    disconnect() {
      if (!connected) return;
      connected = false;
      element.removeEventListener?.("click", onClick, true);
      element.removeEventListener?.("pointerup", onPointerUp, true);
    },
    getClickVersion() {
      return clickVersion;
    },
  };
}

/**
 * Attach the same native-first recovery behavior to a collection of controls.
 */
export function installActivationFallbacks(elements, options = {}) {
  const controllers = [];
  for (const element of elements ?? []) {
    if (!element) continue;
    controllers.push(installMissingActivationFallback({ element, ...options }));
  }

  return {
    controllers,
    disconnect() {
      for (const controller of controllers) controller.disconnect();
    },
  };
}
