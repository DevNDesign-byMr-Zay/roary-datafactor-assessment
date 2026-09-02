/**
 * Aster JavaScript v635
 * Idempotent boolean DOM state reconciler.
 *
 * Applies ARIA, class, and dataset state only when the requested value differs
 * from the element's current value. This keeps repeated reconciliation loops
 * from generating redundant DOM mutations.
 */

function assertElementLike(element) {
  if (!element || typeof element.getAttribute !== "function" || typeof element.setAttribute !== "function") {
    throw new TypeError("element must support getAttribute() and setAttribute()");
  }
  if (!element.classList || typeof element.classList.contains !== "function" || typeof element.classList.toggle !== "function") {
    throw new TypeError("element must expose a DOMTokenList-like classList");
  }
  if (!element.dataset || typeof element.dataset !== "object") {
    throw new TypeError("element must expose a dataset object");
  }
}

function normalizeClassNames(value) {
  if (value == null) return [];
  const source = Array.isArray(value) ? value : [value];
  const seen = new Set();
  const out = [];
  for (const item of source) {
    const name = String(item || "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

function normalizeOptions(options = {}) {
  return {
    ariaAttribute: options.ariaAttribute === false ? null : String(options.ariaAttribute || "aria-pressed"),
    ariaTrue: String(options.ariaTrue ?? "true"),
    ariaFalse: String(options.ariaFalse ?? "false"),
    classNames: normalizeClassNames(options.classNames ?? ["active"]),
    dataKey: options.dataKey === false ? null : String(options.dataKey || "active"),
    dataTrue: String(options.dataTrue ?? "1"),
    dataFalse: String(options.dataFalse ?? "0")
  };
}

export function matchesBooleanState(element, active, options = {}) {
  assertElementLike(element);
  const config = normalizeOptions(options);
  const want = Boolean(active);

  if (config.ariaAttribute) {
    const expected = want ? config.ariaTrue : config.ariaFalse;
    if (element.getAttribute(config.ariaAttribute) !== expected) return false;
  }

  for (const className of config.classNames) {
    if (element.classList.contains(className) !== want) return false;
  }

  if (config.dataKey) {
    const expected = want ? config.dataTrue : config.dataFalse;
    if (element.dataset[config.dataKey] !== expected) return false;
  }

  return true;
}

export function applyBooleanState(element, active, options = {}) {
  assertElementLike(element);
  const config = normalizeOptions(options);
  const want = Boolean(active);
  let writes = 0;

  if (config.ariaAttribute) {
    const expected = want ? config.ariaTrue : config.ariaFalse;
    if (element.getAttribute(config.ariaAttribute) !== expected) {
      element.setAttribute(config.ariaAttribute, expected);
      writes += 1;
    }
  }

  for (const className of config.classNames) {
    if (element.classList.contains(className) !== want) {
      element.classList.toggle(className, want);
      writes += 1;
    }
  }

  if (config.dataKey) {
    const expected = want ? config.dataTrue : config.dataFalse;
    if (element.dataset[config.dataKey] !== expected) {
      element.dataset[config.dataKey] = expected;
      writes += 1;
    }
  }

  return Object.freeze({ active: want, writes, changed: writes > 0 });
}

export function reconcileBooleanStates(elements, isActive, options = {}) {
  if (typeof isActive !== "function") throw new TypeError("isActive must be a function");
  const list = Array.from(elements || []);
  let changedElements = 0;
  let writes = 0;

  list.forEach((element, index) => {
    const want = Boolean(isActive(element, index));
    if (matchesBooleanState(element, want, options)) return;
    const result = applyBooleanState(element, want, options);
    writes += result.writes;
    if (result.changed) changedElements += 1;
  });

  return Object.freeze({ checked: list.length, changedElements, writes });
}
