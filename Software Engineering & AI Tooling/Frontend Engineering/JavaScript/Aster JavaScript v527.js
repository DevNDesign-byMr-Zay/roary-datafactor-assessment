/* Aster JavaScript v527
Buyer-safe historical derivative: run delayed media-ingest passes after matching execution actions so late-rendered variants are captured.
*/
function bindPostExecutionMediaIngest({ root = document, executionSelectors = [], ingest, delays = [700, 2200] } = {}) {
  if (typeof ingest !== "function") return () => {};
  const selector = executionSelectors.filter(Boolean).join(",");
  const schedule = () => delays.forEach(delay => setTimeout(() => Promise.resolve(ingest()).catch(() => {}), Math.max(0, Number(delay) || 0)));
  const onClick = event => {
    const target = event.target;
    if (!selector || !(target instanceof Element) || !target.closest(selector)) return;
    schedule();
  };
  root.addEventListener("click", onClick, true);
  return () => root.removeEventListener("click", onClick, true);
}
