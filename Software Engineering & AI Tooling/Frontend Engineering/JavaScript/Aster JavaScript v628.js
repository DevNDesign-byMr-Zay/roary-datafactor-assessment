/**
 * Determine whether a view is currently active from accessibility and visual state.
 * Explicit aria-hidden values take precedence; otherwise computed visibility is used.
 */
export function isViewActive(
  view,
  {
    getStyle = (element) => globalThis.getComputedStyle(element),
    opacityThreshold = 0.01,
  } = {},
) {
  if (!view) return false;

  const ariaHidden = String(view.getAttribute?.("aria-hidden") ?? "").toLowerCase();
  if (ariaHidden === "false") return true;
  if (ariaHidden === "true") return false;

  try {
    const style = getStyle(view);
    if (!style) return false;

    const display = String(style.display ?? "").toLowerCase();
    const visibility = String(style.visibility ?? "").toLowerCase();
    const opacity = Number.parseFloat(String(style.opacity ?? "1"));

    if (display === "none") return false;
    if (visibility === "hidden" || visibility === "collapse") return false;
    if (Number.isFinite(opacity) && opacity <= opacityThreshold) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Keep a dependent UI state synchronized with a view whose active state is
 * expressed through aria-hidden, class, or inline-style mutations.
 */
export function createObservedViewStateSync({
  view,
  apply,
  observerFactory = (callback) => new MutationObserver(callback),
  getStyle,
  opacityThreshold = 0.01,
  attributeFilter = ["aria-hidden", "class", "style"],
} = {}) {
  if (!view) throw new TypeError("view is required");
  if (typeof apply !== "function") throw new TypeError("apply must be a function");
  if (typeof observerFactory !== "function") {
    throw new TypeError("observerFactory must be a function");
  }

  let active = false;
  let observer = null;

  const sync = () => {
    active = isViewActive(view, { getStyle, opacityThreshold });
    apply(active);
    return active;
  };

  active = sync();
  observer = observerFactory(sync);
  if (!observer || typeof observer.observe !== "function") {
    throw new TypeError("observerFactory must return an observer");
  }

  observer.observe(view, {
    attributes: true,
    attributeFilter: [...attributeFilter],
  });

  return {
    sync,
    isActive: () => active,
    disconnect() {
      observer?.disconnect?.();
      observer = null;
    },
  };
}

/**
 * Convenience bridge that reflects the observed view state as a class on
 * another element while retaining the generic observer lifecycle above.
 */
export function syncClassToObservedView({
  view,
  target,
  className,
  ...options
} = {}) {
  if (!target?.classList) throw new TypeError("target with classList is required");
  const normalizedClass = String(className ?? "").trim();
  if (!normalizedClass) throw new TypeError("className is required");

  return createObservedViewStateSync({
    view,
    ...options,
    apply(active) {
      target.classList.toggle(normalizedClass, active);
      options.apply?.(active);
    },
  });
}
