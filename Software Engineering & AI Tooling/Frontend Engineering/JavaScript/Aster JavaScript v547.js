/* Aster JavaScript v547
Buyer-safe historical derivative: synchronize expansion geometry and late-bound mask wrapping in capture phase before existing tool handlers execute.
*/
function installImageToolPreflight({ root = document, isExpandTrigger, isRemoveTrigger, syncExpand, ensureMaskWrapper, retryMs = 6000, pollMs = 250 } = {}) {
  const started = Date.now();
  const timer = setInterval(() => {
    try { ensureMaskWrapper?.(); } catch {}
    if (Date.now() - started >= retryMs) clearInterval(timer);
  }, pollMs);
  const onClick = event => {
    const target = event.target;
    try { if (isExpandTrigger?.(target)) syncExpand?.(); } catch {}
    try { if (isRemoveTrigger?.(target)) ensureMaskWrapper?.(); } catch {}
  };
  root.addEventListener("click", onClick, true);
  return () => { clearInterval(timer); root.removeEventListener("click", onClick, true); };
}
