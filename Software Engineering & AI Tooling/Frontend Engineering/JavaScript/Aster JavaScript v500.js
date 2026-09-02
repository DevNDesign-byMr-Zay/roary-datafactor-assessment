/* Aster JavaScript v500
Authenticated historical derivative: combine synthetic progress with bounded backend polling through the locked 5151 service.
*/
function createProgressPoller(progressId, onPercent, { base = "http://127.0.0.1:5151", fakeIntervalMs = 180, pollIntervalMs = 220 } = {}) {
  const url = new URL(String(base));
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.port !== "5151") throw new Error("Invalid local image-tool base");
  let fake = 0, fakeTimer = null, pollTimer = null, stopped = false;
  const emit = value => onPercent?.(Math.max(0, Math.min(100, Number(value) || 0)));
  const stop = () => {
    stopped = true;
    if (fakeTimer) clearInterval(fakeTimer);
    if (pollTimer) clearInterval(pollTimer);
    fakeTimer = pollTimer = null;
  };
  const start = () => {
    stopped = false;
    fakeTimer = setInterval(() => {
      if (fake < 92) { fake += fake < 35 ? 2 : fake < 70 ? 1 : 0.5; emit(fake); }
    }, fakeIntervalMs);
    pollTimer = setInterval(async () => {
      if (stopped) return;
      try {
        const response = await fetch(`${url.protocol}//${url.host}/tool/progress/${encodeURIComponent(progressId)}`, { method: "GET", mode: "cors", credentials: "omit", cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (data?.ok && data.percent != null) emit(data.percent);
        if (data?.status === "done" || data?.status === "error") stop();
      } catch {}
    }, pollIntervalMs);
  };
  return { start, stop };
}
