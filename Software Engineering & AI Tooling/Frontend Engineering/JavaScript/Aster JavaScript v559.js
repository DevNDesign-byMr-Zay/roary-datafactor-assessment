/* Aster JavaScript v559
Buyer-safe historical derivative: expose a late-hydrating core operation through a stable legacy alias without forwarding stale abort signals.
*/
function bindLateCoreAlias({ getCore, target = globalThis, alias, retryMs = 250, maxTries = 20 } = {}) {
  if (!alias || typeof getCore !== "function") return () => {};
  let tries = 0, timer = null;
  const bind = () => {
    const core = getCore();
    if (typeof core !== "function") return false;
    target[alias] = async input => core(String(input || "").trim(), {});
    return true;
  };
  if (!bind()) timer = setInterval(() => {
    tries += 1;
    if (bind() || tries > maxTries) { clearInterval(timer); timer = null; }
  }, retryMs);
  return () => { if (timer) clearInterval(timer); };
}
