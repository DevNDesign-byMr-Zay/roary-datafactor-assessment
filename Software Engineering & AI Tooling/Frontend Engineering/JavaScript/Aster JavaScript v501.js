/* Aster JavaScript v501
Authenticated historical derivative: keep one stable attachment collection even when external code reassigns the public array reference.
*/
function createStableAttachmentStore(target = globalThis, key = "sessionAttachments") {
  const initial = Array.isArray(target[key]) ? target[key] : [];
  const items = initial;
  const replace = value => {
    items.length = 0;
    if (Array.isArray(value)) items.push(...value);
    return items;
  };
  try {
    Object.defineProperty(target, key, {
      configurable: true,
      get: () => items,
      set: value => { replace(value); }
    });
  } catch (_) {
    target[key] = items;
  }
  return { get: () => items, replace };
}
